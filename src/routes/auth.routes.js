const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/auth.controller');


router.get('/login', (req, res) => {
    res.render('auth/login', { errorMessage: null });
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

router.get('/', (req, res) => {
    res.render('auth/login', { errorMessage: null });
});
module.exports = router;
