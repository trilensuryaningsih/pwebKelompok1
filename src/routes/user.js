const express = require('express');

const router = express.Router();


router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});


router.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user');
    }
    res.render('home',  { user: req.session.user });
});

router.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

module.exports = router;