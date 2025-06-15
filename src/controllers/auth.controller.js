const jwt = require('jsonwebtoken');
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
            role
        });
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET );
        res.status(201).json({ user, token });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
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
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3d' });
        await user.update({ refreshToken }, { where: { id: user.id } });
        res.status(200).json({ message: "Login berhasil", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const iduser = req.user.id;
        const user = await user_id.findByPk(iduser);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.status(200).json({ message: "Token refreshed", token, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}; 
