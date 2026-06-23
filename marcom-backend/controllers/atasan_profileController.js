const db = require("../config/db");
const bcrypt = require("bcrypt");

// Get Profile

const getProfile = async (req, res) => {
  try {

    const userId =
      req.user.id;

    const result =
      await db.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          divisi,
          jabatan,
          status
        FROM users
        WHERE id = $1
      `,
        [userId]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "User tidak ditemukan",
      });
    }

    res.status(200).json(
      result.rows[0]
    );

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message:
        "Gagal mengambil profil",
    });

  }
};

// CHANGE PASSWORD

const changePassword =
  async (req, res) => {

    try {

      const userId =
        req.user.id;

      const {
        oldPassword,
        newPassword,
        confirmPassword,
      } = req.body;

      if (
        !oldPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res.status(400).json({
          message:
            "Semua field wajib diisi",
        });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return res.status(400).json({
          message:
            "Konfirmasi password tidak cocok",
        });
      }

      const user =
        await db.query(
          `
          SELECT password
          FROM users
          WHERE id = $1
        `,
          [userId]
        );

      if (
        user.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "User tidak ditemukan",
        });
      }

      const validPassword =
        await bcrypt.compare(
          oldPassword,
          user.rows[0]
            .password
        );

      if (
        !validPassword
      ) {
        return res.status(400).json({
          message:
            "Password lama salah",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      await db.query(
        `
        UPDATE users
        SET
          password = $1,
          updated_at = NOW()
        WHERE id = $2
      `,
        [
          hashedPassword,
          userId,
        ]
      );

      res.status(200).json({
        message:
          "Password berhasil diubah",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Gagal mengubah password",
      });

    }
  };

// Ganti Email
const changeEmail =
  async (req, res) => {

    try {

      const userId =
        req.user.id;

      const {
        newEmail,
        password,
      } = req.body;

      if (
        !newEmail ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Semua field wajib diisi",
        });
      }

      const user =
        await db.query(
          `
          SELECT password
          FROM users
          WHERE id = $1
        `,
          [userId]
        );

      if (
        user.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "User tidak ditemukan",
        });
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.rows[0]
            .password
        );

      if (
        !validPassword
      ) {
        return res.status(400).json({
          message:
            "Password salah",
        });
      }

      const emailExist =
        await db.query(
          `
          SELECT id
          FROM users
          WHERE email = $1
        `,
          [newEmail]
        );

      if (
        emailExist.rows.length > 0
      ) {
        return res.status(400).json({
          message:
            "Email sudah digunakan",
        });
      }

      await db.query(
        `
        UPDATE users
        SET
          email = $1,
          updated_at = NOW()
        WHERE id = $2
      `,
        [
          newEmail,
          userId,
        ]
      );

      res.status(200).json({
        message:
          "Email berhasil diubah",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Gagal mengubah email",
      });

    }
  };

module.exports = {
  getProfile,
  changePassword,
  changeEmail,
};