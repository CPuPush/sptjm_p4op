const { User } = require("../models");
const { verifyToken } = require("../helper/jwt");

async function authentication(req, res, next) {
  try {
    // const token = req.headers.authorization;\
    let token = req.headers.authorization || req.cookies.token;

    // 2. Jika token menggunakan skema "Bearer <token>", kita bersihkan
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    // 3. Jika sama sekali tidak ada token
    if (!token) {
      // Jika request datang dari browser (bukan AJAX), arahkan ke halaman login
      if (req.headers['accept']?.includes('text/html')) {
        return res.redirect('/login');
      }
      return res.status(401).json({ message: "Sesi kadaluarsa, silakan login kembali" });
    }

    const userDecoded = verifyToken(token);

    const userById = await User.findOne({
      where: {
        id: userDecoded.id,
      }
    });
    if(!userById){
      return res.status(401).json({
        message: "No active account found with the given credentials"
      });
    }
    res.dataUser = userById;
    res.locals.user = userById;
    // res.locals.user = user;
    return next();

  } catch (error) {
    console.error("Auth Error:", error.message);
    res.clearCookie('token');
    
    if (req.headers['accept']?.includes('text/html')) {
      return res.redirect('/login');
    }
    
    return res.status(401).json({
      status: 'error',
      message: "Token tidak valid atau sudah kadaluarsa"
    });
  }
}

module.exports = authentication;
