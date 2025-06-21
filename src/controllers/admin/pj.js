const { User } = require('../../models');

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
            res.render('admin/pj/index', { pjUsers });
        } catch (error) {
            console.error('Error fetching PJ users:', error);
            res.status(500).send('Error fetching PJ users');
        }
    },

    // Menambah PJ baru
    createPJ: async (req, res) => {
        try {
            const { name, email, phone_number, password } = req.body;
            let errors = [];

            // Validasi input
            if (!name || !email || !phone_number || !password) {
                errors.push('Semua field harus diisi');
            }

            // Validasi format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push('Format email tidak valid');
            }

            // Cek apakah email sudah terdaftar
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                errors.push('Email sudah terdaftar');
            }

            // Validasi nomor telepon (minimal 10 digit, maksimal 13 digit)
            const phoneRegex = /^[0-9]{10,13}$/;
            if (!phoneRegex.test(phone_number)) {
                errors.push('Nomor telepon harus berupa 10-13 digit angka');
            }

            // Validasi password (minimal 6 karakter)
            if (password.length < 6) {
                errors.push('Password minimal 6 karakter');
            }

            if (errors.length > 0) {
                return res.render('admin/add-pj', { errors });
            }

            await User.create({
                name,
                email,
                phone_number,
                password,
                role: 'pj',
                is_active: true
            });

            req.flash('success', 'PJ berhasil ditambahkan');
            res.redirect('/admin/pj');
        } catch (error) {
            console.error('Error creating PJ:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.render('admin/add-pj', { 
                    errors: ['Email atau nomor telepon sudah terdaftar']
                });
            }
            res.status(500).render('error', { 
                message: 'Terjadi kesalahan saat menambahkan penanggung jawab'
            });
        }
    },

    // Mengupdate data PJ
    updatePJ: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone_number, is_active } = req.body;
            
            const pj = await User.findByPk(id);
            if (!pj) {
                req.flash('error', 'PJ tidak ditemukan');
                return res.redirect('/admin/pj');
            }

            await pj.update({ name, email, phone_number, is_active });
            req.flash('success', 'Data PJ berhasil diperbarui');
            res.redirect('/admin/pj');
        } catch (error) {
            console.error('Error updating PJ:', error);
            res.status(500).render('error', { 
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
                req.flash('error', 'PJ tidak ditemukan');
                return res.redirect('/admin/pj');
            }

            await pj.destroy();
            req.flash('success', 'PJ berhasil dihapus');
            res.redirect('/admin/pj');
        } catch (error) {
            console.error('Error deleting PJ:', error);
            res.status(500).render('error', { 
                message: 'Terjadi kesalahan saat menghapus PJ'
            });
        }
    }
};

module.exports = pjController;