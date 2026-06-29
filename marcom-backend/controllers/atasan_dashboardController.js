const db = require("../config/db");

// 1. Dashboard Summary (Murni Database)
const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Ambil user ID dari token autentikasi Anda
    const currentUserId = req.user?.id; 

    if (!currentUserId) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }
    
    // Satukan query summary dan nama user menggunakan CROSS JOIN
    let summaryQuery = `
      SELECT
        u.name AS user_logged_name,
        COUNT(cr.id) FILTER (WHERE cr.status = 'Menunggu')::int AS menunggu,
        COUNT(cr.id) FILTER (WHERE cr.status = 'Diproses')::int AS diproses,
        COUNT(cr.id) FILTER (WHERE cr.status = 'Revisi')::int AS revisi,
        COUNT(cr.id) FILTER (WHERE cr.status = 'Selesai')::int AS selesai,
        COUNT(cr.id) FILTER (WHERE cr.status = 'Ditolak')::int AS ditolak,
        COUNT(cr.id)::int AS total
      FROM users u
      LEFT JOIN content_requests cr ON 1=1
    `;
    
    const params = [currentUserId];
    summaryQuery += " WHERE u.id = $1::uuid"; // Disesuaikan ke UUID

    // Jika ada filter tanggal, tambahkan ke kondisi JOIN atau WHERE
    if (startDate && endDate) {
      summaryQuery += " AND (cr.entry_date::date BETWEEN $2::date AND $3::date OR cr.id IS NULL)";
      params.push(startDate, endDate);
    }

    summaryQuery += " GROUP BY u.name";

    const result = await db.query(summaryQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data user tidak ditemukan di database" });
    }

    // Mengembalikan data summary dan nama user langsung dari database
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil summary dashboard" });
  }
};

// 2. Pie Chart (Status Distribution)
const getStatusDistribution = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT
        status,
        COUNT(*)::int AS total
      FROM content_requests cr
      WHERE 1=1
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += " AND cr.entry_date::date BETWEEN $1::date AND $2::date";
      params.push(startDate, endDate);
    }

    query += " GROUP BY status ORDER BY status";

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil distribusi status" });
  }
};

// 3. Workload Anggota (REVISI: Progres, Selesai, dan Total dari 4 status utama)
const getWorkload = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const params = [];
    
    let dateFilter = "";
    if (startDate && endDate) {
      dateFilter = " AND cr.entry_date::date BETWEEN $1::date AND $2::date";
      params.push(startDate, endDate);
    }
    const query = `
      SELECT
        u.id,
        u.name,
        COUNT(cr.id) FILTER (WHERE cr.status IN ('Menunggu', 'Diproses', 'Revisi'))::int AS progres,
        COUNT(cr.id) FILTER (WHERE cr.status = 'Selesai')::int AS selesai,
        COUNT(cr.id) FILTER (WHERE cr.status = 'Ditolak')::int AS ditolak,
        COUNT(cr.id) FILTER (WHERE cr.status IN ('Menunggu', 'Diproses', 'Revisi', 'Selesai','Ditolak'))::int AS total_request
      FROM users u
      LEFT JOIN content_requests cr
        ON cr.pic_id = u.id ${dateFilter}
      WHERE u.role = 'marcom_member'
      GROUP BY u.id, u.name
      ORDER BY total_request DESC, u.name ASC
    `;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil workload" });
  }
};

// 4. Request Prioritas
const getPriorityRequests = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT
        cr.id,
        cr.request_code,
        cr.title,
        cr.deadline,
        cr.status,
        u.name AS pic_name
      FROM content_requests cr
      LEFT JOIN users u ON u.id = cr.pic_id
      WHERE cr.is_priority = true
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += " AND cr.entry_date::date BETWEEN $1::date AND $2::date";
      params.push(startDate, endDate);
    }

    query += " ORDER BY cr.deadline ASC";

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil request prioritas" });
  }
};

// 5. Ambil Riwayat Komentar (FIXED: Menyesuaikan skema kolom 'comment' & casting UUID)
const getCommentNotifications = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    const query = `
      SELECT 
        rc.id AS comment_id,
        rc.id AS notification_id,
        rc.is_read,
        rc.request_id,
        rc.comment AS comment_text, 
        rc.created_at,
        u.name AS commenter_name
      FROM request_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.user_id <> $1::uuid
      ORDER BY rc.created_at DESC
      LIMIT 20
    `;

    const result = await db.query(query, [currentUserId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil riwayat komentar" });
  }
};

// 6. Tandai Komentar sebagai 'sudah dibaca' 
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE request_comments 
      SET is_read = true 
      WHERE id = $1
      RETURNING id AS comment_id, is_read, request_id
    `;
    
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data komentar tidak ditemukan" });
    }

    res.status(200).json({ message: "Komentar berhasil ditandai sebagai dibaca", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui status baca komentar" });
  }
};

module.exports = {
  getSummary,
  getStatusDistribution,
  getWorkload,
  getPriorityRequests,
  getCommentNotifications,
  markNotificationAsRead,
};