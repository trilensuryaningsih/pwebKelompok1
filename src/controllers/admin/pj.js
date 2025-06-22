const { User } = require('../../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pjController = {
    // Menampilkan halaman tambah PJ
    showAddPJPage: (req, res) => {
        res.render('admin/pj/create');
    },
    // Menampilkan halaman kelola PJ
    showPJPage: async (req, res) => {
        try {
            const pjUsers = await User.findAll({
                where: { role: 'pj' }
            });
            res.render('admin/pj/index', { 
                pjUsers,
                path: '/admin/pj' // Variabel 'path' yang dibutuhkan sidebar
            });
        } catch (error) {
            console.error('Error fetching PJ users:', error);
            res.status(500).send('Error fetching PJ users');
        }
    },

    // Menambah PJ baru
    createPJ: async (req, res) => {
        try {
            const { name, email, phone_number, password, confirm_password } = req.body;
            let errors = [];

            // Validasi input
            if (!name || !email || !phone_number || !password || !confirm_password) {
                errors.push({ msg: 'Semua field harus diisi' });
            }

            // Validasi format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                errors.push({ msg: 'Format email tidak valid' });
            }

            // Validasi nomor telepon (minimal 10 digit, maksimal 13 digit)
            const phoneRegex = /^[0-9]{10,13}$/;
            if (phone_number && !phoneRegex.test(phone_number)) {
                errors.push({ msg: 'Nomor telepon harus berupa 10-13 digit angka' });
            }

            // Validasi konfirmasi password
            if (password && confirm_password && password !== confirm_password) {
                errors.push({ message: 'Konfirmasi password tidak cocok' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            // Cek apakah email sudah terdaftar
            if (email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    errors.push({ message: 'Email sudah terdaftar' });
                }
            }

            if (errors.length > 0) {
                return res.render('admin/pj/create', { 
                    errors,
                    formData: { name, email, phone_number }
                });
            }

            await User.create({
                name,
                email,
                phone_number,
                password: hashedPassword,
                role: 'pj',
                is_active: true
            });

            req.flash('success', 'PJ berhasil ditambahkan');
            res.redirect('/admin/pj');
        } catch (error) {
            console.error('Error creating PJ:', error);
            req.flash('error', 'Terjadi kesalahan saat menambahkan penanggung jawab');
            res.redirect('/admin/pj/create');
        }
    },

    // Mengupdate data PJ
    updatePJ: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone_number, is_active, password } = req.body;
            
            const pj = await User.findByPk(id);
            if (!pj) {
                return res.status(404).json({ message: 'PJ tidak ditemukan' });
            }

            // Data yang akan diupdate
            const dataToUpdate = {
                name,
                email,
                phone_number,
                is_active: is_active === 'true' || is_active === true
            };

            // Jika ada password baru, validasi dan hash password tersebut
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                dataToUpdate.password = hashedPassword;
            }

            await pj.update(dataToUpdate);

            // Ambil data terbaru setelah update untuk dikirim kembali
            const updatedPJ = await User.findByPk(id, {
                attributes: { exclude: ['password'] } // Jangan kirim password kembali
            });

            res.json({ 
                success: true, 
                message: 'Data PJ berhasil diperbarui',
                data: updatedPJ
            });
        } catch (error) {
            console.error('Error updating PJ:', error);
            res.status(500).json({ 
                success: false,
                message: 'Terjadi kesalahan saat memperbarui data PJ' 
            });
        }
    },

    // Menghapus PJ
    deletePJ: async (req, res) => {
        try {
            const { id } = req.params;
            const pj = await User.findByPk(id);
            
            if (!pj) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'PJ tidak ditemukan' 
                });
            }

            await pj.destroy();
            return res.json({ 
                success: true, 
                message: 'PJ berhasil dihapus' 
            });
        } catch (error) {
            console.error('Error deleting PJ:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Terjadi kesalahan saat menghapus PJ' 
            });
        }
    }
};

module.exports = pjController;