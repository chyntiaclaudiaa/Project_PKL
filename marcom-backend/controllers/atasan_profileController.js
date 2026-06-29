const db = require("../config/db");
const bcrypt = require("bcrypt");

// 1. GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `
        SELECT id, name, email, role, divisi, jabatan, status
        FROM users WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil profil" });
  }
};

// 2. CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const user = await db.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Gunakan currentPassword untuk dicocokkan dengan hash database
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `
        UPDATE users 
        SET password = $1, updated_at = NOW() 
        WHERE id = $2
      `,
      [hashedPassword, userId]
    );

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengubah password" });
  }
};

// 3. GANTI EMAIL 
const changeEmail = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { email, newEmail, confirmPassword } = req.body;
    const targetEmail = newEmail || email;

    if (!targetEmail) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    if (confirmPassword) {
      const user = await db.query(
        `SELECT password FROM users WHERE id = $1`,
        [userId]
      );
      if (user.rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
      const validPassword = await bcrypt.compare(confirmPassword, user.rows[0].password);
      if (!validPassword) {
        return res.status(400).json({ message: "Password salah" });
      }
    }

    const emailExist = await db.query(
      `SELECT id FROM users WHERE email = $1 AND id != $2`,
      [targetEmail, userId]
    );

    if (emailExist.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const name = req.body.name;
    if (name) {
      await db.query(
        `UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3`,
        [name, targetEmail, userId]
      );
    } else {
      await db.query(
        `UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2`,
        [targetEmail, userId]
      );
    }

    res.status(200).json({ message: "Profil/Email berhasil diubah" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengubah email" });
  }
};

module.exports = {
  getProfile,
  changePassword,
  changeEmail,
};