// src/controllers/admin/notifikasiJasa.js

// =========================================================================
// FIX #1: CARA IMPORT MODEL YANG BENAR DAN SATU-SATUNYA YANG ANDA PERLUKAN
// Kita panggil Model dengan nama class-nya (huruf kapital): Notifikasi, User, item
// =========================================================================
const { notifikasi, item, user_id } = require('../../models'); 

// FUNGSI UNTUK MENAMPILKAN FORM (SUDAH DIPERBAIKI)
exports.tampilkanForm = async (req, res) => {
  try {
    const daftarJasa = await item.findAll({
      where: { kategori: 'jasa' },
      order: [['nama', 'ASC']]
    });

    // Menggunakan Model 'User' yang benar
    const daftarUser = await user_id.findAll({
      where: { role: 'user' },
      attributes: ['id', 'email'],
      order: [['email', 'ASC']]
    });

    const { status } = req.query; 
    res.render('admin/notifikasiJasa', { 
      status, 
      jasa: daftarJasa,
      users: daftarUser 
    }); 

  } catch (error) {
    console.error("GAGAL MEMUAT FORM NOTIFIKASI:", error);
    res.status(500).send("Terjadi kesalahan fatal saat memuat halaman. Cek terminal server.");
  }
};

// =========================================================================
// FIX #2: FUNGSI SIMPAN DATA YANG SESUAI DENGAN DATABASE BARU ANDA
// =========================================================================
exports.kirimNotifikasi = async (req, res) => {
  try {
    // Ambil data dari form. Namanya sudah cocok dengan kolom database Anda!
    const { jenis_jasa, penerima_email, judul, pesan, tanggal_tersedia } = req.body;

    // Validasi dasar
    if (!jenis_jasa || !penerima_email || !judul || !pesan || !tanggal_tersedia) {
      return res.redirect('/admin/notifikasi?status=gagal');
    }

    // Langsung simpan ke database.
    // Kita sebutkan semua kolom yang ada di model/database Anda.
    await notifikasi.create({
      penerima_email: penerima_email,
      judul: judul,
      pesan: pesan,
      tanggal_tersedia: tanggal_tersedia,
      id_pengajuan: null, // Kolom ini ada di DB Anda, kita isi null
      // Perhatikan: 'jenis_jasa' tidak ada di tabel database Anda, jadi tidak kita masukkan di sini.
    });

    res.redirect('/admin/notifikasi?status=sukses');

  } catch (error) {
    console.error("GAGAL MENYIMPAN NOTIFIKASI:", error);
    res.redirect('/admin/notifikasi?status=error');
  }
};