const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/auth.controller');


router.get('/login', (req, res) => {
    const { status } = req.query;
    let successMessage = req.flash('success_msg').toString() || null;
    let errorMessage = req.flash('error_msg').toString() || null;

    if (status === 'logged_out') {
        successMessage = 'Anda telah berhasil logout.';
    } else if (status === 'logout_failed') {
        errorMessage = 'Gagal saat mencoba logout. Silakan coba lagi.';
    } else if (status === 'already_logged_out') {
        successMessage = 'Anda sudah logout.';
    }

    res.render('auth/login', { 
        success_msg: successMessage,
        error_msg: errorMessage,
        errorMessage: null
    });
});

// Route untuk login
router.post('/login', authController.login);


router.get('/register', (req, res) => {
    res.render('auth/register', { errorMessage: null });
});

// Route untuk register (sign up)
router.post('/register', authController.register);








// Route untuk logout
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

router.get('/', (req, res) => {
    res.render('auth/login', { errorMessage: null });
});
module.exports = router;
