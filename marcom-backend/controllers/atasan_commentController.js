const db = require("../config/db");

const addComment = async (req, res) => {
  const { request_id, user_id, comment } = req.body;

  try {
    if (!comment) return res.status(400).json({ message: 'Komentar tidak boleh kosong.' });

    const requestData = await db.query(
      `SELECT created_by, pic_id FROM content_requests WHERE id = $1`,
      [request_id]
    );

    if (requestData.rows.length === 0) {
      return res.status(404).json({ message: 'Request tidak ditemukan.' });
    }
    const request = requestData.rows[0];

    const userResult = await db.query(
      `SELECT role FROM users WHERE id = $1`,
      [user_id]
    );
    const senderRole = userResult.rows[0].role;

    let receiverId = request.pic_id ? request.pic_id : request.created_by;

    let insertedId;

    if (receiverId && receiverId !== user_id) {
       const inserted = await db.query(
        `
        INSERT INTO request_comments
        (request_id, user_id, comment, is_read, receiver_id, sender_role)
        VALUES ($1, $2, $3, false, $4, $5)
        RETURNING id
        `,
        [request_id, user_id, comment, receiverId, senderRole]
      );
      insertedId = inserted.rows[0].id;
    } else {
       const inserted = await db.query(
        `
        INSERT INTO request_comments
        (request_id, user_id, comment, is_read, receiver_id, sender_role)
        VALUES ($1, $2, $3, false, NULL, $4)
        RETURNING id
        `,
        [request_id, user_id, comment, senderRole]
      );
      insertedId = inserted.rows[0].id;
    }

    const result = await db.query(
      `
      SELECT
        rc.id,
        rc.request_id,
        rc.user_id,
        rc.comment,
        rc.created_at,
        u.name
      FROM request_comments rc
      JOIN users u ON u.id = rc.user_id
      WHERE rc.id = $1
      `,
      [insertedId]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("Error atasan addComment:", err.message);
    res.status(500).json({ message: "Gagal menambah komentar" });
  }
};

const getComments = async (req, res) => {
  const requestId = req.params.requestId || req.params.id; 

  try {
    const result = await db.query(
      `
      SELECT
        rc.id,
        rc.request_id,
        rc.user_id,
        rc.comment,
        rc.created_at,
        u.name
      FROM request_comments rc
      JOIN users u ON u.id = rc.user_id
      WHERE rc.request_id = $1
      ORDER BY rc.created_at ASC
      `,
      [requestId]
    );

    res.status(200).json(result.rows);

  } catch (err) {
    console.error("Error getComments:", err.message);
    res.status(500).json({ message: "Gagal mengambil komentar" });
  }
};

module.exports = {
  getComments,
  addComment,
};