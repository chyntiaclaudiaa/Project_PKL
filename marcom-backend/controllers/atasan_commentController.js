const db = require("../config/db");

// Ambil komentar
const getComments = async (req, res) => {
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

      JOIN users u
      ON u.id = rc.user_id

      WHERE rc.request_id = $1

      ORDER BY rc.created_at ASC
      `,
      [req.params.requestId]
    );

    res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Gagal mengambil komentar"
    });
  }
};

// Tambah komentar
const addComment = async (req, res) => {

  const {
    request_id,
    user_id,
    comment,
  } = req.body;

  try {

    const inserted = await db.query(
      `
      INSERT INTO request_comments
      (
        request_id,
        user_id,
        comment
      )
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [
        request_id,
        user_id,
        comment,
      ]
    );

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

      JOIN users u
      ON u.id = rc.user_id

      WHERE rc.id = $1
      `,
      [inserted.rows[0].id]
    );

    res.status(201).json(
      result.rows[0]
    );

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Gagal menambah komentar"
    });
  }
};

module.exports = {
  getComments,
  addComment,
};