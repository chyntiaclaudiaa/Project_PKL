const db = require("../config/db");

// Semua Request + Search + Filter
const getAllRequests = async (req, res) => {
  const { search, status } = req.query;

  try {
    let query = `
      SELECT
        cr.*,
        u.name AS pic_name
      FROM content_requests cr
      LEFT JOIN users u
      ON u.id = cr.pic_id
      WHERE 1=1
    `;

    const params = [];
    let index = 1;

    if (search) {
      query += `
        AND (
          cr.request_code ILIKE $${index}
          OR cr.letter_number ILIKE $${index}
          OR cr.title ILIKE $${index}
          OR u.name ILIKE $${index}
          OR cr.platform_target ILIKE $${index}
          OR cr.status ILIKE $${index}
          OR TO_CHAR(cr.deadline,'YYYY-MM-DD') ILIKE $${index}
        )
      `;
      params.push(`%${search}%`);
      index++;
    }

    if (status) {
      query += `
        AND cr.status = $${index}
      `;
      params.push(status);
      index++;
    }

    query += `
      ORDER BY cr.created_at DESC
    `;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil request" });
  }
};

// Detail Request
const getRequestById = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        cr.*,
        u.name AS pic_name
      FROM content_requests cr
      LEFT JOIN users u
      ON u.id = cr.pic_id
      WHERE cr.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Request tidak ditemukan" });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil detail request" });
  }
};

// Ubah Status
const updateRequestStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const updated = await db.query(
      `
      UPDATE content_requests
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );

    res.status(200).json(updated.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update status" });
  }
};

// Prioritas
const togglePriority = async (req, res) => {
  try {
    const result = await db.query(
      `
      UPDATE content_requests
      SET is_priority = NOT is_priority
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update prioritas" });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  togglePriority,
};