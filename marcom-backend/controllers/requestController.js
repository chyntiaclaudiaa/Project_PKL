const db = require('../config/db');
const { createGoogleCalendarEvent } = require('../services/googleCalendarService');
const {
    createGoogleDriveFolder,
    uploadFileToDriveFolder,
    uploadFilesToDriveFolder
} = require('../services/googleDriveService');

// Helper untuk ubah string dari form-data menjadi boolean
const toBoolean = (value) => {
    return value === true || value === 'true' || value === 'on' || value === '1';
};

const buildReminderOverrides = ({
    reminder_h7,
    reminder_h3,
    reminder_h1,
    reminder_deadline_day
}) => {
    const overrides = [];

    if (toBoolean(reminder_h7)) {
        overrides.push({
            method: 'popup',
            minutes: 7 * 24 * 60
        });
    }

    if (toBoolean(reminder_h3)) {
        overrides.push({
            method: 'popup',
            minutes: 3 * 24 * 60
        });
    }

    if (toBoolean(reminder_h1)) {
        overrides.push({
            method: 'popup',
            minutes: 24 * 60
        });
    }

    if (toBoolean(reminder_deadline_day)) {
        overrides.push({
            method: 'popup',
            minutes: 0
        });
    }

    return overrides;
};

const formatDeadlineForGoogle = (deadline) => {
    if (!deadline) return null;

    const value = String(deadline);

    if (value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)) {
        return value;
    }

    if (value.length === 16) {
        return `${value}:00+07:00`;
    }

    if (value.length === 19) {
        return `${value}+07:00`;
    }

    return value;
};

const addMinutesToDateTime = (dateTime, minutes) => {
    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
};


// 1. Membuat request konten baru
const createRequest = async (req, res) => {
    try {
        // ✅ Validasi req.body ada atau tidak
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: 'Request body kosong. Pastikan data dikirim dengan benar (Content-Type: application/json).',
            });
        }

        const {
            letter_number,
            entry_date,
            deadline,
            title,
            requester_division,
            description,
            platform_target,
            pic_id,
            reminder_h7,
            reminder_h3,
            reminder_h1,
            reminder_deadline_day
        } = req.body;

        const created_by = req.user?.id;

        if (!created_by) {
            return res.status(401).json({
                message: 'User tidak ditemukan. Pastikan sudah login.'
            });
        }

        // Validasi field wajib
        if (!letter_number || !entry_date || !deadline || !title || !requester_division || !description) {
            return res.status(400).json({
                message: 'Field wajib belum lengkap.',
                required: ['letter_number', 'entry_date', 'deadline', 'title', 'requester_division', 'description']
            });
        }

        console.log('Inserting request with data:', {
            letter_number,
            entry_date,
            deadline,
            title,
            requester_division,
            description,
            platform_target,
            pic_id,
            created_by,
            reminder_h7,
            reminder_h3,
            reminder_h1,
            reminder_deadline_day
        });

        const insertResult = await db.query(
            `INSERT INTO content_requests (
                letter_number,
                entry_date,
                deadline,
                title,
                requester_division,
                description,
                platform_target,
                pic_id,
                created_by,
                status,
                reminder_h7,
                reminder_h3,
                reminder_h1,
                reminder_deadline_day
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14
            ) RETURNING *`,
            [
                letter_number.trim(),
                entry_date,
                deadline,
                title.trim(),
                requester_division,
                description.trim(),
                platform_target || null,
                pic_id || null,
                created_by,
                'Menunggu',
                toBoolean(reminder_h7),
                toBoolean(reminder_h3),
                toBoolean(reminder_h1),
                toBoolean(reminder_deadline_day)
            ]
        );

        const request = insertResult.rows[0];
        console.log('Request inserted with ID:', request.id);

        const requestCode = `REQ-${String(request.id).padStart(3, '0')}`;

        const updateCodeResult = await db.query(
            `UPDATE content_requests
             SET request_code = $1
             WHERE id = $2
             RETURNING *`,
            [requestCode, request.id]
        );

        await db.query(
            `INSERT INTO request_status_history (
                request_id,
                old_status,
                new_status,
                changed_by,
                note
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
                request.id,
                null,
                'Menunggu',
                created_by,
                'Request pertama kali dibuat.'
            ]
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
                     SET drive_folder_id = $1,
                         drive_subfolders = $2
                     WHERE id = $3`,
                    [
                        driveResult.mainFolderId,
                        JSON.stringify(driveResult.subfolders),
                        finalRequest.id
                    ]
                );

                finalRequest.drive_folder_id = driveResult.mainFolderId;
                finalRequest.drive_subfolders = driveResult.subfolders;
            }
        } catch (driveErr) {
            console.warn('Google Drive error:', driveErr.message);
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
                console.log('Google Calendar event created:', googleEventId);
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
        console.error('ERROR di createRequest:', err.message);
        console.error('Full error:', err);
        console.error('Request body:', req.body);
        
        res.status(500).json({
            message: 'Gagal membuat request konten.',
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.toString() : undefined
        });
    }
};

// 2. Mengambil request milik anggota yang sedang login
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
                cr.created_at,
                cr.updated_at,
                creator.name AS created_by_name,
                pic.name AS pic_name
            FROM content_requests cr
            LEFT JOIN users creator ON cr.created_by = creator.id
            LEFT JOIN users pic ON cr.pic_id = pic.id
            WHERE cr.created_by = $1 OR cr.pic_id = $1
            ORDER BY cr.created_at DESC`,
            [userId]
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal mengambil data request saya.'
        });
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
                COUNT(*) FILTER (WHERE status = 'Revisi') AS revisi,
                COUNT(*) FILTER (WHERE status = 'Selesai') AS selesai,
                COUNT(*) FILTER (WHERE status = 'Ditolak') AS ditolak
            FROM content_requests
            WHERE created_by = $1 OR pic_id = $1`,
            [userId]
        );

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal mengambil ringkasan dashboard.'
        });
    }
};

const getAllRequestSummary = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Menunggu') AS menunggu,
                COUNT(*) FILTER (WHERE status = 'Diproses') AS diproses,
                COUNT(*) FILTER (WHERE status = 'Revisi') AS revisi,
                COUNT(*) FILTER (WHERE status = 'Selesai') AS selesai,
                COUNT(*) FILTER (WHERE status = 'Ditolak') AS ditolak
            FROM content_requests`
        );

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('ERROR GET ALL REQUEST SUMMARY:', err.message);
        res.status(500).json({
            message: 'Gagal mengambil ringkasan semua request.'
        });
    }
};

// 4. Mengambil detail satu request
const getRequestDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const requestResult = await db.query(
            `SELECT
                cr.*,
                creator.name AS created_by_name,
                creator.email AS created_by_email,
                pic.name AS pic_name,
                pic.email AS pic_email
            FROM content_requests cr
            LEFT JOIN users creator ON cr.created_by = creator.id
            LEFT JOIN users pic ON cr.pic_id = pic.id
            WHERE cr.id = $1`,
            [id]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Request tidak ditemukan.'
            });
        }

        const commentsResult = await db.query(
            `SELECT
                rc.id,
                rc.comment,
                rc.created_at,
                u.name AS user_name,
                u.role AS user_role
            FROM request_comments rc
            JOIN users u ON rc.user_id = u.id
            WHERE rc.request_id = $1
            ORDER BY rc.created_at ASC`,
            [id]
        );

        const historyResult = await db.query(
            `SELECT
                rsh.id,
                rsh.old_status,
                rsh.new_status,
                rsh.note,
                rsh.created_at,
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
        res.status(500).json({
            message: 'Gagal mengambil detail request.'
        });
    }
};

// 5. Edit request konten
const updateRequest = async (req, res) => {
    const { id } = req.params;

    const {
        letter_number,
        entry_date,
        deadline,
        title,
        requester_division,
        description,
        platform_target,
        pic_id,
        reminder_h7,
        reminder_h3,
        reminder_h1,
        reminder_deadline_day
    } = req.body;

    try { 
        // Cek request dulu
        const existingRequest = await db.query(
            `
            SELECT
            status,
            drive_folder_id
            FROM content_requests
            WHERE id = $1
            `,
            [id]
            );

        if (existingRequest.rows.length === 0) {
            return res.status(404).json({
                message: 'Request tidak ditemukan.'
            });
        }

        // Request yang sudah selesai tidak boleh diedit
        if (existingRequest.rows[0].status === 'Selesai') {
            return res.status(400).json({
                message: 'Request yang sudah selesai tidak dapat diedit.'
            });
        }

        const result = await db.query(
            `UPDATE content_requests
             SET
                letter_number = $1,
                entry_date = $2,
                deadline = $3,
                title = $4,
                requester_division = $5,
                description = $6,
                platform_target = $7,
                pic_id = $8,
                reminder_h7 = $9,
                reminder_h3 = $10,
                reminder_h1 = $11,
                reminder_deadline_day = $12,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $13
             RETURNING *`,
            [
                letter_number,
                entry_date,
                deadline,
                title,
                requester_division,
                description,
                platform_target || null,
                pic_id || null,
                toBoolean(reminder_h7),
                toBoolean(reminder_h3),
                toBoolean(reminder_h1),
                toBoolean(reminder_deadline_day),
                id
            ]
        );

        res.status(200).json({
            message: 'Request berhasil diperbarui.',
            request: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal memperbarui request.'
        });
    }
};

// 6. Mengubah status request
const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const changedBy = req.user.id;

    const allowedStatuses = ['Menunggu', 'Diproses', 'Selesai', 'Revisi', 'Ditolak'];

    try {
        if (!status) {
            return res.status(400).json({
                message: 'Status wajib diisi.'
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Status tidak valid.'
            });
        }

        const existingRequest = await db.query(
            `SELECT status FROM content_requests WHERE id = $1`,
            [id]
        );

        if (existingRequest.rows.length === 0) {
            return res.status(404).json({
                message: 'Request tidak ditemukan.'
            });
        }

        const oldStatus = existingRequest.rows[0].status;

        const result = await db.query(
            `UPDATE content_requests
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        await db.query(
            `INSERT INTO request_status_history (
                request_id,
                old_status,
                new_status,
                changed_by,
                note
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
                id,
                oldStatus,
                status,
                changedBy,
                note || `Status diubah dari ${oldStatus} menjadi ${status}.`
            ]
        );

        res.status(200).json({
            message: 'Status request berhasil diperbarui.',
            request: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal memperbarui status request.'
        });
    }
};

// 7. Upload hasil konten
const uploadResultFile = async (req, res) => {
    const { id } = req.params;

    // Dukung req.files (multer .array()) ATAU req.file (multer .single(),
    // untuk backward compatibility kalau route belum diupdate).
    const files = req.files && req.files.length > 0
        ? req.files
        : (req.file ? [req.file] : []);

    try {
        if (files.length === 0) {
            return res.status(400).json({
                message: 'File hasil konten wajib diupload.'
            });
        }

        const existingRequest = await db.query(
            `
            SELECT status,
            drive_folder_id,
            drive_subfolders
            FROM content_requests
            WHERE id = $1
            `,
            [id]
        );

        if (existingRequest.rows.length === 0) {
            return res.status(404).json({
                message: 'Request tidak ditemukan.'
            });
        }

        const folderId =
            existingRequest.rows[0].drive_folder_id;

        if (!folderId) {
            return res.status(400).json({
                message: 'Folder Google Drive belum tersedia.'
            });
        }

        const currentStatus = existingRequest.rows[0].status;
        const subfolders = existingRequest.rows[0].drive_subfolders;

        // Validasi: hanya status tertentu yang boleh upload
        const allowedStatusForUpload = ['Diproses', 'Revisi', 'Selesai'];
        if (!allowedStatusForUpload.includes(currentStatus)) {
            return res.status(400).json({
                message: `Status "${currentStatus}" tidak dapat mengupload file. Hanya status "Diproses", "Revisi", dan "Selesai" yang dapat mengupload.`
            });
        }

        // Tentukan target folder berdasarkan status
        let targetFolderId = folderId;

        if (subfolders) {
            if (currentStatus === 'Diproses' || currentStatus === 'Revisi') {
                // Upload ke Draft folder untuk status Diproses dan Revisi
                targetFolderId = subfolders.draft || folderId;
            } else if (currentStatus === 'Selesai') {
                // Upload ke Final folder untuk status Selesai
                targetFolderId = subfolders.final || folderId;
            }
        }

        const uploadedDriveFiles =
            await uploadFilesToDriveFolder(
                req.user.id,
                targetFolderId,
                files
        );

        if (uploadedDriveFiles.length === 0) {
            return res.status(500).json({
                message: 'Gagal upload ke Google Drive.'
            });
        }

        const result = await db.query(
            `UPDATE content_requests
             SET result_file = $1,
                 result_drive_link = $2,
                 result_drive_files = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [files[0].path,
             uploadedDriveFiles[0].webViewLink,
             JSON.stringify(uploadedDriveFiles),
             id]
        );

        // Catat history upload tanpa mengubah status
        await db.query(
            `INSERT INTO request_status_history (
                request_id,
                old_status,
                new_status,
                changed_by,
                note
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
                id,
                existingRequest.rows[0].status,
                existingRequest.rows[0].status,
                req.user.id,
                `File telah diupload ke folder ${currentStatus === 'Selesai' ? 'Final' : 'Draft'} (${uploadedDriveFiles.length} file).`
            ]
        );

        res.status(200).json({
            message: uploadedDriveFiles.length < files.length
                ? 'Sebagian file berhasil diupload, sebagian gagal. Cek log server.'
                : 'Hasil konten berhasil diupload.',
            request: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal mengupload hasil konten.'
        });
    }
};

// 8. Menambahkan komentar
const addComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    try {
        if (!comment) {
            return res.status(400).json({
                message: 'Komentar tidak boleh kosong.'
            });
        }

        const existingRequest = await db.query(
            `SELECT id FROM content_requests WHERE id = $1`,
            [id]
        );

        if (existingRequest.rows.length === 0) {
            return res.status(404).json({
                message: 'Request tidak ditemukan.'
            });
        }

        const result = await db.query(
            `INSERT INTO request_comments (
                request_id,
                user_id,
                comment
            )
            VALUES ($1, $2, $3)
            RETURNING *`,
            [id, userId, comment]
        );

        res.status(201).json({
            message: 'Komentar berhasil ditambahkan.',
            comment: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal menambahkan komentar.'
        });
    }
};

const getPicUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, name, email, role
             FROM users
             WHERE role = 'marcom_member'
             AND status = 'Aktif'
             ORDER BY name ASC`
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('ERROR GET PIC USERS:', err.message);
        res.status(500).json({
            message: 'Gagal mengambil daftar PIC.'
        });
    }
};

// Hapus komentar
const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    const userId = req.user.id;
    try {
        // ini buat cek komentar ada gak
        const commentCheck = await db.query(
            `SELECT user_id FROM request_comments WHERE id = $1 AND request_id = $2`,
            [commentId, id]
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({
                message: 'Komentar tidak ditemukan.'
            });
        }

        // Hanya pembuat komentar atau admin yang bisa hapus
        const isCreator = commentCheck.rows[0].user_id === userId;
        
        if (!isCreator) {
            return res.status(403).json({
                message: 'Anda hanya bisa menghapus komentar milik Anda sendiri.'
            });
        }

        await db.query(
            `DELETE FROM request_comments WHERE id = $1`,
            [commentId]
        );

        res.status(200).json({
            message: 'Komentar berhasil dihapus.'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal menghapus komentar.'
        });
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
    deleteComment  
};