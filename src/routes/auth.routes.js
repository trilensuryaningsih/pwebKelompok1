const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/auth.controller');

// Route untuk register (sign up)
router.post('/register', authController.register);

// Route untuk login
router.post('/login', authController.login);

// Route untuk logout
router.post('/logout', authController.logout);

router.get('/', (req, res) => {
    res.render('login', { errorMessage: null });
});
module.exports = router;
