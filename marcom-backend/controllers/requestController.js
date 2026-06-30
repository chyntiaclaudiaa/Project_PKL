const db = require('../config/db');
const { createGoogleCalendarEvent } = require('../services/googleCalendarService');
const {
    createGoogleDriveFolder,
    uploadFilesToDriveFolder,
} = require('../services/googleDriveService');


const toBoolean = (value) =>
    value === true || value === 'true' || value === 'on' || value === '1';

const buildReminderOverrides = ({ reminder_h7, reminder_h3, reminder_h1, reminder_deadline_day }) => {
    const overrides = [];
    if (toBoolean(reminder_h7))             overrides.push({ method: 'popup', minutes: 7 * 24 * 60 });
    if (toBoolean(reminder_h3))             overrides.push({ method: 'popup', minutes: 3 * 24 * 60 });
    if (toBoolean(reminder_h1))             overrides.push({ method: 'popup', minutes: 24 * 60 });
    if (toBoolean(reminder_deadline_day))   overrides.push({ method: 'popup', minutes: 0 });
    return overrides;
};

const formatDeadlineForGoogle = (deadline) => {
    if (!deadline) return null;
    const value = String(deadline);
    if (value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)) return value;
    if (value.length === 16) return `${value}:00+07:00`;
    if (value.length === 19) return `${value}+07:00`;
    return value;
};

// ─── CONTROLLERS ────────────────────────────────────────────────────────────

// 1. Membuat request konten baru
const createRequest = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: 'Request body kosong. Pastikan data dikirim dengan benar (Content-Type: application/json).',
            });
        }

        const {
            letter_number, entry_date, deadline, title,
            requester_division, description, platform_target, pic_id,
            reminder_h7, reminder_h3, reminder_h1, reminder_deadline_day
        } = req.body;

        const created_by = req.user?.id;

        if (!created_by) {
            return res.status(401).json({ message: 'User tidak ditemukan. Pastikan sudah login.' });
        }

        if (!letter_number || !entry_date || !deadline || !title || !requester_division || !description) {
            return res.status(400).json({
                message: 'Field wajib belum lengkap.',
                required: ['letter_number', 'entry_date', 'deadline', 'title', 'requester_division', 'description']
            });
        }

        const insertResult = await db.query(
            `INSERT INTO content_requests (
                letter_number, entry_date, deadline, title, requester_division,
                description, platform_target, pic_id, created_by, status,
                reminder_h7, reminder_h3, reminder_h1, reminder_deadline_day
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            RETURNING *`,
            [
                letter_number.trim(), entry_date, deadline, title.trim(),
                requester_division, description.trim(), platform_target || null,
                pic_id || null, created_by, 'Menunggu',
                toBoolean(reminder_h7), toBoolean(reminder_h3),
                toBoolean(reminder_h1), toBoolean(reminder_deadline_day)
            ]
        );

        const request = insertResult.rows[0];
        const requestCode = `REQ-${String(request.id).padStart(3, '0')}`;

        const updateCodeResult = await db.query(
            `UPDATE content_requests SET request_code = $1 WHERE id = $2 RETURNING *`,
            [requestCode, request.id]
        );

        await db.query(
            `INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, note)
             VALUES ($1, $2, $3, $4, $5)`,
            [request.id, null, 'Menunggu', created_by, 'Request pertama kali dibuat.']
        );

        const finalRequest = updateCodeResult.rows[0];

        let driveResult = null;
        try {
            driveResult = await createGoogleDriveFolder(
                created_by,
                `${finalRequest.request_code}-${finalRequest.letter_number}`
            );

            if (driveResult) {
                await db.query(
                    `UPDATE content_requests
                     SET drive_folder_id = $1, drive_subfolders = $2
                     WHERE id = $3`,
                    [driveResult.mainFolderId, JSON.stringify(driveResult.subfolders), finalRequest.id]
                );
                finalRequest.drive_folder_id = driveResult.mainFolderId;
                finalRequest.drive_subfolders = driveResult.subfolders;
            } else {
                console.warn('createRequest: folder Drive tidak berhasil dibuat (akan dicoba ulang saat upload)');
            }
        } catch (driveErr) {
            console.warn('Google Drive error saat buat folder:', driveErr.message);
        }

        let googleEventId = null;
        try {
            googleEventId = await createGoogleCalendarEvent({
                userId: created_by,
                requestId: finalRequest.id,
                requestCode: finalRequest.request_code,
                letterNumber: finalRequest.letter_number,
                deadline: finalRequest.deadline,
                title: finalRequest.title,
                requesterDivision: finalRequest.requester_division,
                description: finalRequest.description,
                platformTarget: finalRequest.platform_target,
                reminder_h7: finalRequest.reminder_h7,
                reminder_h3: finalRequest.reminder_h3,
                reminder_h1: finalRequest.reminder_h1,
                reminder_deadline_day: finalRequest.reminder_deadline_day
            });

            if (googleEventId) {
                await db.query(
                    `UPDATE content_requests SET google_event_id = $1 WHERE id = $2`,
                    [googleEventId, finalRequest.id]
                );
                finalRequest.google_event_id = googleEventId;
            }
        } catch (calendarErr) {
            console.warn('Google Calendar error:', calendarErr.message);
        }

        res.status(201).json({
            message: googleEventId
                ? 'Request konten berhasil dibuat dan masuk ke Google Calendar.'
                : 'Request konten berhasil dibuat.',
            request: finalRequest
        });

    } catch (err) {
        console.error('ERROR di createRequest:', err.message, err);
        res.status(500).json({
            message: 'Gagal membuat request konten.',
            error: err.message,
        });
    }
};

const getMyRequests = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT
                cr.id,
                cr.request_code,
                cr.letter_number,
                cr.entry_date,
                cr.deadline,
                cr.title,
                cr.requester_division,
                cr.description,
                cr.platform_target,
                cr.status,
                cr.result_file,
                cr.result_drive_files,
                cr.result_drive_link,
                cr.drive_folder_id,
                cr.created_at,
                cr.updated_at,
                creator.name AS created_by_name,
                pic.name    AS pic_name,
                -- Komentar digabung dalam satu array JSON
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id',         rc.id,
                                'comment',    rc.comment,
                                'created_at', rc.created_at,
                                'user_name',  u.name,
                                'user_role',  u.role
                            ) ORDER BY rc.created_at ASC
                        )
                        FROM request_comments rc
                        JOIN users u ON rc.user_id = u.id
                        WHERE rc.request_id = cr.id
                    ),
                    '[]'::json
                ) AS comments
            FROM content_requests cr
            LEFT JOIN users creator ON cr.created_by = creator.id
            LEFT JOIN users pic     ON cr.pic_id     = pic.id
            WHERE cr.created_by = $1 OR cr.pic_id = $1
            ORDER BY cr.created_at DESC`,
            [userId]
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error('ERROR getMyRequests:', err.message);
        res.status(500).json({ message: 'Gagal mengambil data request saya.' });
    }
};

const getMyDashboardSummary = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Menunggu') AS menunggu,
                COUNT(*) FILTER (WHERE status = 'Diproses') AS diproses,
                COUNT(*) FILTER (WHERE status = 'Revisi')   AS revisi,
                COUNT(*) FILTER (WHERE status = 'Selesai')  AS selesai,
                COUNT(*) FILTER (WHERE status = 'Ditolak')  AS ditolak
            FROM content_requests
            WHERE created_by = $1 OR pic_id = $1`,
            [userId]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard.' });
    }
};

const getAllRequestSummary = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Menunggu') AS menunggu,
                COUNT(*) FILTER (WHERE status = 'Diproses') AS diproses,
                COUNT(*) FILTER (WHERE status = 'Revisi')   AS revisi,
                COUNT(*) FILTER (WHERE status = 'Selesai')  AS selesai,
                COUNT(*) FILTER (WHERE status = 'Ditolak')  AS ditolak
            FROM content_requests`
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('ERROR getAllRequestSummary:', err.message);
        res.status(500).json({ message: 'Gagal mengambil ringkasan semua request.' });
    }
};

const getRequestDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const requestResult = await db.query(
            `SELECT
                cr.*,
                creator.name  AS created_by_name,
                creator.email AS created_by_email,
                pic.name      AS pic_name,
                pic.email     AS pic_email
            FROM content_requests cr
            LEFT JOIN users creator ON cr.created_by = creator.id
            LEFT JOIN users pic     ON cr.pic_id     = pic.id
            WHERE cr.id = $1`,
            [id]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ message: 'Request tidak ditemukan.' });
        }

        const commentsResult = await db.query(
            `SELECT rc.id, rc.comment, rc.created_at, u.name AS user_name, u.role AS user_role
             FROM request_comments rc
             JOIN users u ON rc.user_id = u.id
             WHERE rc.request_id = $1
             ORDER BY rc.created_at ASC`,
            [id]
        );

        const historyResult = await db.query(
            `SELECT rsh.id, rsh.old_status, rsh.new_status, rsh.note, rsh.created_at,
                    u.name AS changed_by_name
             FROM request_status_history rsh
             LEFT JOIN users u ON rsh.changed_by = u.id
             WHERE rsh.request_id = $1
             ORDER BY rsh.created_at ASC`,
            [id]
        );

        res.status(200).json({
            request: requestResult.rows[0],
            comments: commentsResult.rows,
            status_history: historyResult.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal mengambil detail request.' });
    }
};

// 6. Edit request konten
const updateRequest = async (req, res) => {
    const { id } = req.params;
    const {
        letter_number, entry_date, deadline, title,
        requester_division, description, platform_target, pic_id,
        reminder_h7, reminder_h3, reminder_h1, reminder_deadline_day
    } = req.body;

    try {
        const existingRequest = await db.query(
            `SELECT status FROM content_requests WHERE id = $1`,
            [id]
        );

        if (existingRequest.rows.length === 0) {
            return res.status(404).json({ message: 'Request tidak ditemukan.' });
        }

        if (existingRequest.rows[0].status === 'Selesai') {
            return res.status(400).json({ message: 'Request yang sudah selesai tidak dapat diedit.' });
        }

        const result = await db.query(
            `UPDATE content_requests
             SET letter_number = $1, entry_date = $2, deadline = $3, title = $4,
                 requester_division = $5, description = $6, platform_target = $7,
                 pic_id = $8, reminder_h7 = $9, reminder_h3 = $10,
                 reminder_h1 = $11, reminder_deadline_day = $12, updated_at = CURRENT_TIMESTAMP
             WHERE id = $13
             RETURNING *`,
            [
                letter_number, entry_date, deadline, title,
                requester_division, description, platform_target || null,
                pic_id || null, toBoolean(reminder_h7), toBoolean(reminder_h3),
                toBoolean(reminder_h1), toBoolean(reminder_deadline_day), id
            ]
        );

        res.status(200).json({ message: 'Request berhasil diperbarui.', request: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal memperbarui request.' });
    }
};

// 7. Ubah status request
const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const changedBy = req.user.id;
    const allowedStatuses = ['Menunggu', 'Diproses', 'Selesai', 'Revisi', 'Ditolak'];

    try {
        if (!status) return res.status(400).json({ message: 'Status wajib diisi.' });
        if (!allowedStatuses.includes(status)) return res.status(400).json({ message: 'Status tidak valid.' });

        const existingRequest = await db.query(
            `SELECT status FROM content_requests WHERE id = $1`,
            [id]
        );

        if (existingRequest.rows.length === 0) {
            return res.status(404).json({ message: 'Request tidak ditemukan.' });
        }

        const oldStatus = existingRequest.rows[0].status;

        const result = await db.query(
            `UPDATE content_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, id]
        );

        await db.query(
            `INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, note)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, oldStatus, status, changedBy, note || `Status diubah dari ${oldStatus} menjadi ${status}.`]
        );

        res.status(200).json({ message: 'Status request berhasil diperbarui.', request: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal memperbarui status request.' });
    }
};

// 8. Upload hasil konten
// FIX: (a) fallback buat folder jika drive_folder_id masih NULL
//      (b) log error asli agar error message dari Drive kelihatan di modal frontend
const uploadResultFile = async (req, res) => {
    const { id } = req.params;
    const files = req.files?.length > 0 ? req.files : (req.file ? [req.file] : []);

    try {
        if (files.length === 0) {
            return res.status(400).json({ message: 'File hasil konten wajib diupload.' });
        }

        const existingResult = await db.query(
            `SELECT status, drive_folder_id, drive_subfolders FROM content_requests WHERE id = $1`,
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Request tidak ditemukan.' });
        }

        const allowedStatusForUpload = ['Diproses', 'Revisi', 'Selesai'];
        const { status: currentStatus, drive_subfolders } = existingResult.rows[0];
        let { drive_folder_id: folderId } = existingResult.rows[0];

        if (!allowedStatusForUpload.includes(currentStatus)) {
            return res.status(400).json({
                message: `Status "${currentStatus}" tidak bisa upload. Hanya "Diproses", "Revisi", dan "Selesai" yang diizinkan.`
            });
        }

        // FIX: Jika folder Drive belum ada (gagal saat createRequest),
        //      coba buat sekarang sebelum upload.
        if (!folderId) {
            console.warn(`uploadResultFile: request ${id} belum punya drive_folder_id, mencoba buat folder...`);

            // Ambil data request untuk nama folder
            const reqData = await db.query(
                `SELECT request_code, letter_number, created_by FROM content_requests WHERE id = $1`,
                [id]
            );
            const { request_code, letter_number, created_by } = reqData.rows[0];

            const driveResult = await createGoogleDriveFolder(
                created_by,
                `${request_code}-${letter_number}`
            );

            if (driveResult) {
                await db.query(
                    `UPDATE content_requests SET drive_folder_id = $1, drive_subfolders = $2 WHERE id = $3`,
                    [driveResult.mainFolderId, JSON.stringify(driveResult.subfolders), id]
                );
                folderId = driveResult.mainFolderId;

                // Refresh subfolders
                existingResult.rows[0].drive_subfolders = driveResult.subfolders;
                console.log(`Folder Drive berhasil dibuat (retry): ${folderId}`);
            } else {
                return res.status(500).json({
                    message: 'Folder Google Drive belum tersedia dan gagal dibuat ulang. Hubungi admin untuk cek koneksi service account.'
                });
            }
        }

        // Tentukan target subfolder berdasarkan status
        const subfolders = existingResult.rows[0].drive_subfolders;
        let targetFolderId = folderId;
        if (subfolders) {
            if (currentStatus === 'Diproses' || currentStatus === 'Revisi') {
                targetFolderId = subfolders.draft || folderId;
            } else if (currentStatus === 'Selesai') {
                targetFolderId = subfolders.final || folderId;
            }
        }

        console.log(`uploadResultFile: upload ${files.length} file ke folder ${targetFolderId}`);

        const uploadedDriveFiles = await uploadFilesToDriveFolder(req.user.id, targetFolderId, files);

        if (uploadedDriveFiles.length === 0) {
            // Log detail error sudah ada di driveService, tapi tambahkan konteks di sini
            console.error(`uploadResultFile: semua ${files.length} file gagal diupload ke Drive`);
            return res.status(500).json({
                message: 'Gagal upload ke Google Drive. Semua file ditolak — cek log server untuk detail error.'
            });
        }

        // Gabungkan dengan file yang sudah ada sebelumnya (supaya riwayat versi tidak hilang)
        const existingFiles = await db.query(
            `SELECT result_drive_files FROM content_requests WHERE id = $1`,
            [id]
        );
        let previousFiles = [];
        try {
            const raw = existingFiles.rows[0]?.result_drive_files;
            previousFiles = raw
                ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
                : [];
        } catch (_) {}

        const allFiles = [...previousFiles, ...uploadedDriveFiles];

        const result = await db.query(
            `UPDATE content_requests
             SET result_file        = $1,
                 result_drive_link  = $2,
                 result_drive_files = $3,
                 updated_at         = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [files[0].path, uploadedDriveFiles[0].webViewLink, JSON.stringify(allFiles), id]
        );

        await db.query(
            `INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, note)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                id, currentStatus, currentStatus, req.user.id,
                `${uploadedDriveFiles.length} file diupload ke folder ${currentStatus === 'Selesai' ? 'Final' : 'Draft'}.`
            ]
        );

        const partialFail = uploadedDriveFiles.length < files.length;
        res.status(200).json({
            message: partialFail
                ? `${uploadedDriveFiles.length} dari ${files.length} file berhasil diupload. Sebagian gagal — cek log server.`
                : `${uploadedDriveFiles.length} file berhasil diupload ke Google Drive.`,
            request: result.rows[0]
        });

    } catch (err) {
        // Log full error agar bisa terlihat di terminal backend
        console.error('ERROR uploadResultFile:', err.message);
        console.error(err.stack);
        res.status(500).json({
            message: `Gagal mengupload hasil konten: ${err.message}`
        });
    }
};

// 9. Tambah komentar
const addComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    try {
        if (!comment) return res.status(400).json({ message: 'Komentar tidak boleh kosong.' });

        const requestData = await db.query(
            `SELECT created_by, pic_id FROM content_requests WHERE id = $1`,
            [id]
        );

        if (requestData.rows.length === 0) {
            return res.status(404).json({ message: 'Request tidak ditemukan.' });
        }

        const request = requestData.rows[0];

        const userResult = await db.query(
            `SELECT role FROM users WHERE id = $1`,
            [userId]
        );
        const senderRole = userResult.rows[0].role;

        let receiverId = null;

        if (userId === request.created_by) {
            receiverId = request.pic_id;
        } else if (userId === request.pic_id) {
            receiverId = request.created_by;
        } else {
            receiverId = request.pic_id ? request.pic_id : request.created_by;
        }

        if (receiverId && receiverId !== userId) {
            const result = await db.query(
                `INSERT INTO request_comments
                (request_id, user_id, comment, is_read, receiver_id, sender_role)
                VALUES ($1, $2, $3, false, $4, $5)
                RETURNING *`,
                [id, userId, comment, receiverId, senderRole]
            );
            return res.status(201).json({ message: 'Komentar berhasil ditambahkan.', comment: result.rows[0] });
        } else {
            const result = await db.query(
                `INSERT INTO request_comments
                (request_id, user_id, comment, is_read, receiver_id, sender_role)
                VALUES ($1, $2, $3, false, NULL, $4)
                RETURNING *`,
                [id, userId, comment, senderRole]
            );
            return res.status(201).json({ message: 'Komentar berhasil ditambahkan tanpa notifikasi khusus.', comment: result.rows[0] });
        }
    } catch (err) {
        console.error('Error addComment:', err.message); 
        res.status(500).json({ message: 'Gagal menambahkan komentar.' });
    }
};

const getPicUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, name, email, role FROM users
             WHERE role = 'marcom_member' AND status = 'Aktif'
             ORDER BY name ASC`
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('ERROR getPicUsers:', err.message);
        res.status(500).json({ message: 'Gagal mengambil daftar PIC.' });
    }
};

const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    const userId = req.user.id;
    try {
        const commentCheck = await db.query(
            `SELECT user_id FROM request_comments WHERE id = $1 AND request_id = $2`,
            [commentId, id]
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Komentar tidak ditemukan.' });
        }

        if (commentCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Anda hanya bisa menghapus komentar milik Anda sendiri.' });
        }

        await db.query(`DELETE FROM request_comments WHERE id = $1`, [commentId]);
        res.status(200).json({ message: 'Komentar berhasil dihapus.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal menghapus komentar.' });
    }
};


const getNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(`
            SELECT
                rc.id,
                rc.request_id,
                rc.comment,
                rc.is_read,
                rc.created_at,
                cr.title,
                u.name AS sender_name
            FROM request_comments rc
            JOIN content_requests cr ON rc.request_id = cr.id
            JOIN users u ON rc.user_id = u.id
            WHERE rc.receiver_id = $1
            ORDER BY rc.created_at DESC
            LIMIT 20
        `, [userId]);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil notifikasi.' });
    }
};

const markNotificationRead = async (req, res) => {
    const { commentId } = req.params;
    try {
        await db.query(
            `UPDATE request_comments SET is_read = true WHERE id = $1`,
            [commentId]
        );
        res.status(200).json({ message: 'Notifikasi ditandai sudah dibaca.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal menandai notifikasi.' });
    }
};


module.exports = {
    getPicUsers,
    createRequest,
    getMyRequests,
    getMyDashboardSummary,
    getAllRequestSummary,
    getRequestDetail,
    updateRequest,
    updateRequestStatus,
    uploadResultFile,
    addComment,
    deleteComment,
    getNotifications,
    markNotificationRead 
};