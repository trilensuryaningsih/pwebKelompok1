const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/auth.controller');


router.get('/login', (req, res) => {
    const successMessage = req.query.success === 'logout' ? 'Berhasil logout!' : null;
    res.render('auth/login', { errorMessage: null, successMessage: successMessage });
});

// Route untuk login
router.post('/login', authController.login);


router.get('/register', (req, res) => {
    res.render('auth/register', { errorMessage: null });
});

// Route untuk register (sign up)
router.post('/register', authController.register);








// Route untuk logout
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

router.get('/', (req, res) => {
    const successMessage = req.query.success === 'logout' ? 'Berhasil logout!' : null;
    res.render('auth/login', { errorMessage: null, successMessage: successMessage });
});
module.exports = router;
