var express = require('express');
var router = express.Router();
const authentication = require('../middleware/authentication');

const UserController = require("../controller/UserController");
const SptjmController = require('../controller/SptjmController');

// ! FORM INPUT
router.get("/sptjm/add", authentication, (req, res) => {
    res.render("form-sptjm", { 
        user: req.dataUser,
        currentPage: 'add', // Pastikan currentPage ada
        currentDate: new Date().toISOString().split('T')[0]
    });
});

// ! USER
router.post("/users/register", UserController.userRegister);
router.post("/users/login", UserController.userLogin);
router.delete('/users/delete/:userId', authentication, UserController.userDelete);

// ! SPTJM Transaction
router.get("/sptjm", SptjmController.getAllTransactions);
router.get("/sptjm/track/:npsn", SptjmController.trackByNpsn);
router.get("/sptjm/school/:npsn", SptjmController.searchSchoolByNpsn);
router.get("/sptjm/last-trx/:masterSekolahId", SptjmController.getLastTransaction);
router.get("/sptjm/edit/:id", authentication, SptjmController.renderEditPage); 
router.put("/sptjm/:id", authentication, SptjmController.updateTransaction);
router.get("/sptjm/export", authentication, SptjmController.exportToExcel);
router.post("/sptjm/create", authentication, SptjmController.createTransaction);
router.get("/sptjm/:id", authentication, SptjmController.getTransactionById);
router.patch("/sptjm/pickup/:id", authentication, SptjmController.updatePickupStatus);
router.delete("/sptjm/:id", authentication, SptjmController.deleteTransaction);

// ! DASHBOARD & MONITORING
router.get("/dashboard", authentication, SptjmController.renderDashboard);
router.get("/dashboard2", authentication, SptjmController.renderDashboard2);

// TAMBAHKAN BARIS INI
router.get("/monitoring", authentication, SptjmController.renderMonitoring);

// ! AUTH
router.get("/login", (req, res) => {
    if (req.cookies.token) return res.redirect('/dashboard');
    res.render("login", { hideNavbar: true });
});

module.exports = router;