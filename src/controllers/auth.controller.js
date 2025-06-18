
const bcrypt = require('bcrypt');
const { user_id } = require('../models');
//include dotenv
require('dotenv').config();


const register = async (req, res) => {
    try {
        const { nama, password, email, no_hp, role, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords tidak sama" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await user_id.create({
                nama,
                password: hashedPassword,
                no_hp,
                email,
                role: role || 'user' // Default role to 'user' if not provided
            });
            
            // Redirect ke halaman home setelah registrasi berhasil
            res.redirect('/login'); 
            } catch (error) {
                res.render('register', { errorMessage: 'Registrasi gagal, silakan coba lagi.' });
            }
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: error.message });
            }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_id.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Username atau Password salah" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Username atau Password salah" });
        }
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        if (user.role === 'admin') {
            res.redirect('/admin'); // Redirect to admin home
        } else if (user.role === 'pj') {
            res.redirect('/pj'); // Redirect to pj home
        } else if (user.role === 'user') {
            res.redirect('/user/home'); // Redirect to user home
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const logout = (req, res) => {
    try {
        // res.status(200).json({ message: "Logout berhasil" });
        req.session.destroy(() => {
            res.redirect('/user');
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    logout
};