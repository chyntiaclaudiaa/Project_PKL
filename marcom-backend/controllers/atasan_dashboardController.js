const db = require("../config/db");

// 1. Dashboard Summary
const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'Menunggu')::int AS menunggu,
        COUNT(*) FILTER (WHERE status = 'Diproses')::int AS diproses,
        COUNT(*) FILTER (WHERE status = 'Revisi')::int AS revisi,
        COUNT(*) FILTER (WHERE status = 'Selesai')::int AS selesai,
        COUNT(*) FILTER (WHERE status = 'Ditolak')::int AS ditolak,
        COUNT(*)::int AS total
      FROM content_requests cr
      WHERE 1=1
    `;
    
    const params = [];
    if (startDate && endDate) {
      // Perbaikan: Konversi eksplisit string parameter menjadi format DATE di PostgreSQL
      query += " AND cr.entry_date::date BETWEEN $1::date AND $2::date";
      params.push(startDate, endDate);
    }

    const result = await db.query(query, params);
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
      // Perbaikan: Konversi eksplisit string parameter menjadi format DATE di PostgreSQL
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

// 3. Workload Anggota
const getWorkload = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const params = [];
    
    let dateFilter = "";
    if (startDate && endDate) {
      // Perbaikan: Ambil metode casting yang sama agar seragam
      dateFilter = " AND cr.entry_date::date BETWEEN $1::date AND $2::date";
      params.push(startDate, endDate);
    }

    const query = `
      SELECT
        u.id,
        u.name,
        COUNT(cr.id) FILTER (WHERE cr.status='Menunggu')::int AS menunggu,
        COUNT(cr.id) FILTER (WHERE cr.status='Diproses')::int AS diproses,
        COUNT(cr.id) FILTER (WHERE cr.status='Revisi')::int AS revisi,
        COUNT(cr.id) FILTER (WHERE cr.status='Selesai')::int AS selesai,
        COUNT(cr.id) FILTER (WHERE cr.status='Ditolak')::int AS ditolak,
        COUNT(cr.id)::int AS total_request
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
      // Perbaikan: Konversi eksplisit string parameter menjadi format DATE di PostgreSQL
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

module.exports = {
  getSummary,
  getStatusDistribution,
  getWorkload,
  getPriorityRequests,
};