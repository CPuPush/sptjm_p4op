var express = require('express');
var router = express.Router();
const authentication = require('../middleware/authentication');

const UserController = require("../controller/UserController");
const SptjmController = require('../controller/SptjmController');

// !
router.get("/sptjm/add", authentication, (req, res) => {
    res.render("form-sptjm", { 
        user: req.dataUser,
        currentDate: new Date().toISOString().split('T')[0] // Default tanggal hari ini
    });
});



// ! USER
router.post("/users/register", UserController.userRegister);//clear
router.post("/users/login", UserController.userLogin);//clear
router.delete('/users/delete/:userId', authentication, UserController.userDelete);


// ! SPTJM Transaction
router.get("/sptjm", SptjmController.getAllTransactions); // Dashboard & Filter
// router.get("/sptjm/stats", SptjmController.getStatistics); // <--- Fitur Laporan (Next Step)
router.get("/sptjm/track/:npsn", SptjmController.trackByNpsn); // Fitur Tracking
router.get("/sptjm/school/:npsn", SptjmController.searchSchoolByNpsn); // Smart Search
router.get("/sptjm/last-trx/:masterSekolahId", SptjmController.getLastTransaction); // Memory Form

// Halaman untuk menampilkan form edit
router.get("/sptjm/edit/:id", authentication, SptjmController.renderEditPage); 
// Proses update
router.put("/sptjm/:id", authentication, SptjmController.updateTransaction);


router.get("/sptjm/export", authentication, SptjmController.exportToExcel);

router.post("/sptjm/create", authentication, SptjmController.createTransaction);
router.get("/sptjm/:id", authentication, SptjmController.getTransactionById);
// router.put("/sptjm/:id", authentication, SptjmController.updateTransaction);
router.patch("/sptjm/pickup/:id", authentication, SptjmController.updatePickupStatus); // Klik Selesai
router.delete("/sptjm/:id", authentication, SptjmController.deleteTransaction);



// Route untuk Dashboard (Ini yang dipanggil di browser)
// 1. Halaman Login
router.get("/login", (req, res) => {
    // Jika sudah ada cookie token, jangan biarkan login lagi, lempar ke dashboard
    if (req.cookies.token) return res.redirect('/dashboard');
    res.render("login", { hideNavbar: true }); // Sembunyikan navbar di login
});


// // 2. Halaman Dashboard (Pindahkan logika render ke sini)
// Di file routes/index.js atau file router kamu
router.get("/dashboard", authentication, SptjmController.renderDashboard);
router.get("/dashboard2", authentication, SptjmController.renderDashboard2);




module.exports = router;
