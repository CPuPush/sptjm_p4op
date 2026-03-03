const { User } = require("../models");
const { hashPassword, comparePassword } = require("../helper/bcrypt");
const { generateToken } = require("../helper/jwt");

class UserController {
  // ? User Register
  static async userRegister(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Validasi sederhana
      if (!username || !email || !password || !role) {
        return res.status(400).json({
          status: 'error',
          message: 'Semua field (username, email, password, role) wajib diisi'
        });
      }

      const hashedPassword = hashPassword(password);
      const createUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role
      });

      return res.status(201).json({
        status: 'success',
        data: {
          id: createUser.id,
          username: createUser.username,
          email: createUser.email
        }
      });
    } catch (error) {
      console.error(error);
      if (error.name === "SequelizeUniqueConstraintError" || error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: 'error',
          message: error.errors[0].message
        });
      }
      return res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
  }

  // ? User Login (Updated with Cookie for FE)
  static async userLogin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({
          status: 'error',
          message: "Email atau Password salah"
        });
      }

      // Generate Token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // --- BAGIAN PENTING UNTUK BROWSER/EJS ---
      // Simpan token di Cookie agar browser bisa mengirimkannya otomatis di setiap request
      res.cookie('token', token, {
          httpOnly: true,                // Keamanan ekstra dari script jahat
          maxAge: 24 * 60 * 60 * 1000,   // Expired dalam 1 hari
      });

      return res.status(200).json({
        status: 'success',
        message: 'Login berhasil',
        token // Tetap kirim token untuk kebutuhan Postman
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
  }

  // ? User Logout (Untuk menghapus cookie)
  static async userLogout(req, res) {
    res.clearCookie('token');
    return res.status(200).json({ status: 'success', message: 'Berhasil Logout' });
  }

  // ? User Delete
  static async userDelete(req, res) {
    try {
      const { userId } = req.params;
      await User.destroy({ where: { id: userId } });

      return res.status(200).json({
        status: 'success',
        message: 'Akun berhasil dihapus'
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
  }
}

module.exports = UserController;