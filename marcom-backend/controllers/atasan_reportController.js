const db = require("../config/db");

const getReportData = async (req, res) => {
  try {

    const {
      startDate,
      endDate,
    } = req.query;

    let dateFilter = "";
    let queryParams = [];

    if (startDate && endDate) {

      dateFilter = `
        AND cr.entry_date
        BETWEEN $1 AND $2
      `;

      queryParams = [
        startDate,
        endDate,
      ];
    }

    const summary = await db.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE status = 'Menunggu'
        )::int AS menunggu,

        COUNT(*) FILTER (
          WHERE status = 'Diproses'
        )::int AS diproses,

        COUNT(*) FILTER (
          WHERE status = 'Revisi'
        )::int AS revisi,

        COUNT(*) FILTER (
          WHERE status = 'Selesai'
        )::int AS selesai,

        COUNT(*) FILTER (
          WHERE status = 'Ditolak'
        )::int AS ditolak,

        COUNT(*)::int AS total

      FROM content_requests cr

      WHERE 1=1
      ${dateFilter}
    `, queryParams);

    const workload = await db.query(`
      SELECT
        u.id,
        u.name,

        COUNT(cr.id) FILTER (
          WHERE cr.status = 'Menunggu'
        )::int AS menunggu,

        COUNT(cr.id) FILTER (
          WHERE cr.status = 'Diproses'
        )::int AS diproses,

        COUNT(cr.id) FILTER (
          WHERE cr.status = 'Revisi'
        )::int AS revisi,

        COUNT(cr.id) FILTER (
          WHERE cr.status = 'Selesai'
        )::int AS selesai,

        COUNT(cr.id) FILTER (
          WHERE cr.status = 'Ditolak'
        )::int AS ditolak,

        COUNT(cr.id)::int AS total

      FROM users u

      LEFT JOIN content_requests cr
        ON cr.pic_id = u.id
        ${
          startDate && endDate
            ? "AND cr.entry_date BETWEEN $1 AND $2"
            : ""
        }

      WHERE u.role = 'marcom_member'

      GROUP BY
        u.id,
        u.name

      ORDER BY
        total DESC,
        u.name ASC
    `, queryParams);

    const details = await db.query(`
      SELECT
        cr.id,
        cr.request_code,
        cr.title,
        cr.deadline,
        cr.entry_date,
        cr.status,
        u.name AS pic_name

      FROM content_requests cr

      LEFT JOIN users u
        ON cr.pic_id = u.id

      WHERE 1=1
      ${
        startDate && endDate
          ? "AND cr.entry_date BETWEEN $1 AND $2"
          : ""
      }

      ORDER BY
        cr.deadline ASC
    `, queryParams);

    res.json({
      summary: summary.rows[0],
      workload: workload.rows,
      details: details.rows,
    });

  } catch (err) {

    console.log(
      "===== REPORT ERROR ====="
    );

    console.error(err);

    console.log(
      "========================"
    );

    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getReportData,
};