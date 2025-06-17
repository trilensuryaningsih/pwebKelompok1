const express = require('express');

const router = express.Router();


router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});


router.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user');
    }
    res.render('home', { user: req.session.user });
});

router.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

router.get('/dashboard', (req, res, next) => {
    res.render('user/dashboard', {
    })
});

router.get('/pemesanan', (req, res, next) => {
    res.render('user/pemesanan', {
    })
});

router.get('/mou', (req, res, next) => {
    res.render('user/mou', {
    })
});
module.exports = router;