const express = require('express');
const barangController = require('../controllers/user/barang');
const ordersController = require('../controllers/user/orders');
const { requireAuth } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const path = require('path');
const statusController = require('../controllers/user/status');
const pesanController = require('../controllers/user/pesan');
const mouController = require('../controllers/user/mou');
const cancelController = require('../controllers/user/cancel');
const { Item, Service } = require('../models');

const router = express.Router();

// Home route (menggantikan dashboard)
router.get('/home', requireAuth, async (req, res) => {
    try {
        const items = await Item.findAll({ where: { status: 'available' }, order: [['name', 'ASC']] });
        const services = await Service.findAll({ order: [['name', 'ASC']] });
        res.render('user/home', { items, services, user: req.session.user, currentPage: 'home' });
    } catch (err) {
        res.status(500).send('Gagal memuat data.');
    }
});

// Pemesanan page (alat)
router.get('/pemesanan', requireAuth, async (req, res, next) => {
    try {
        const availableItems = await barangController.getAvailableItems();
        const availableServices = await barangController.getAvailableServices();
        res.render('user/pemesanan', {
            items: availableItems,
            services: availableServices,
            errorMessage: null,
            user: req.session.user,
            currentPage: 'pemesanan'
        });
    } catch (error) {
        console.error('Error loading pemesanan page:', error);
        res.render('user/pemesanan', {
            items: [],
            services: [],
            errorMessage: 'Gagal memuat data barang. Silakan coba lagi.',
            user: req.session.user,
            currentPage: 'pemesanan'
        });
    }
});

// Pemesanan jasa (opsional, jika ada halaman khusus)
router.get('/pemesanan-jasa', async (req, res, next) => {
    try {
        const availableServices = await barangController.getAvailableServices();
        res.render('user/pemesanan-jasa', {
            services: availableServices,
            errorMessage: null,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading pemesanan jasa page:', error);
        res.render('user/pemesanan-jasa', {
            services: [],
            errorMessage: 'Gagal memuat data jasa. Silakan coba lagi.',
            user: req.session.user
        });
    }
});

// Orders page (baru)
router.get('/orders', requireAuth, (req, res, next) => {
    res.render('user/orders', {
        user: req.session.user
    });
});

// Order detail route
router.get('/orders/:id', requireAuth, (req, res, next) => {
    res.render('user/order-detail', {
        user: req.session.user
    });
});

// API endpoint to get items by category
router.get('/items/category/:kategori', async (req, res) => {
    try {
        const { kategori } = req.params;
        const items = await barangController.getItemsByCategory(kategori);
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to check item availability
router.get('/items/availability/:id/:quantity', async (req, res) => {
    try {
        const { id, quantity } = req.params;
        const availability = await barangController.checkItemAvailability(
            parseInt(id), 
            parseInt(quantity)
        );
        res.json(availability);
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to check service availability
router.get('/services/availability/:id/:quantity', async (req, res) => {
    try {
        const { id, quantity } = req.params;
        const availability = await barangController.checkServiceAvailability(parseInt(id), parseInt(quantity));
        res.json(availability);
    } catch (error) {
        console.error('Error checking service availability:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to get available items
router.get('/items/available', async (req, res) => {
    try {
        const availableItems = await barangController.getAvailableItems();
        res.json({ success: true, data: availableItems });
    } catch (error) {
        console.error('Error fetching available items:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to get all items
router.get('/items', async (req, res) => {
    try {
        const items = await barangController.getAllItems();
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ success: false, message: 'Error fetching items' });
    }
});

// API endpoint to get all services
router.get('/services', async (req, res) => {
    try {
        const services = await barangController.getAllServices();
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
});

// API endpoint to get available services
router.get('/services/available', async (req, res) => {
    try {
        const availableServices = await barangController.getAvailableServices();
        res.json({ success: true, data: availableServices });
    } catch (error) {
        console.error('Error fetching available services:', error);
        res.status(500).json({ success: false, message: 'Error fetching available services' });
    }
});

// API routes for orders (baru)
router.get('/orders', ordersController.getUserOrders);
router.get('/orders/:id', ordersController.getOrderById);
router.get('/orders/status/:status', ordersController.getOrdersByStatus);
router.put('/orders/:id/status', ordersController.updateOrderStatus);
router.delete('/orders/:id', ordersController.cancelOrder);
router.get('/orders/stats', ordersController.getOrderStats);
router.post('/orders/:id/cancel', requireAuth, cancelController.cancelOrder);

// MOU, cetak-mou, status
router.get('/mou', requireAuth, mouController.form);
router.post('/mou', requireAuth, mouController.submit);
router.get('/cetak-mou', requireAuth, mouController.cetak);
router.get('/download-mou-pdf', requireAuth, mouController.downloadPdf);

router.get('/status', requireAuth, statusController.getUserOrdersStatus);

// Endpoint untuk generate dan download PDF MOU
router.get('/download-mou-pdf', (req, res) => {
    const mouData = req.session.mouData || {};
    const doc = new PDFDocument({ margin: 50 });
    let filename = `MOU_${(mouData.nama2 || 'user').replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    // Path logo
    const logoUnandPath = path.join(__dirname, '../public/images/logo_unand.png');
    const logoUmcPath = path.join(__dirname, '../public/images/logo_umc.png');

    // Kop header
    const kopY = 50;
    const kopHeight = 60;
    try {
        doc.image(logoUnandPath, 50, kopY, { width: 60, height: kopHeight, align: 'left' });
    } catch (e) {}
    try {
        doc.image(logoUmcPath, 500, kopY, { width: 60, height: kopHeight, align: 'right' });
    } catch (e) {}
    // Geser tulisan kop ke kanan (misal mulai x=140)
    const kopTextX = 140;
    doc.font('Times-Roman').fontSize(18).text('TIM CREATIVE KEMAHASISWAAN', kopTextX, kopY, { align: 'left' });
    doc.font('Times-Roman').fontSize(18).text('UNIVERSAL MULTIMEDIA CREATIVE (UMC)', kopTextX, doc.y, { align: 'left' });
    doc.font('Times-Roman').fontSize(18).text('UNIVERSITAS ANDALAS', kopTextX, doc.y, { align: 'left' });
    doc.font('Times-Roman').fontSize(12).text('Gedung PKM, Kampus Limau manis, Padang – 25163', kopTextX, doc.y, { align: 'left' });
    doc.moveTo(50, kopY + kopHeight + 20).lineTo(545, kopY + kopHeight + 20).stroke();
    doc.moveDown(2);

    // Helper untuk baris baru
    const addSpace = (lines = 1) => {
        for (let i = 0; i < lines; i++) doc.moveDown();
    };

    // Mulai isi dokumen setelah kop, beri margin kiri/kanan/bawah
    const contentMarginLeft = 60;
    const contentMarginRight = 60;
    const contentWidth = 545 - contentMarginLeft - (595-545) - 10; // 545=lebar garis, 595=lebar A4 px, -10 biar tidak mepet
    doc.moveDown(2);
    doc.x = contentMarginLeft;
    doc.fontSize(14).font('Times-Bold').text('SURAT PERJANJIAN KERJASAMA', contentMarginLeft, doc.y, { width: contentWidth, align: 'center' });
    doc.fontSize(12).font('Times-Roman').text('Memorandum of Understanding', contentMarginLeft, doc.y, { width: contentWidth, align: 'center' });
    addSpace(2);
    doc.fontSize(11).font('Times-Roman').text(
        `Pada tanggal ${mouData.tanggal || '-'} bulan ${mouData.bulan || '-'} tahun ${mouData.tahun || '-'}, kami yang bertanda tangan di bawah ini:`,
        contentMarginLeft, doc.y, { width: contentWidth, align: 'left' }
    );
    addSpace();
    doc.font('Times-Bold').text('Pihak I');
    doc.font('Times-Roman').text('Nama: Toni Windra');
    doc.text('Instansi: Universal Multimedia Creative');
    doc.text('Jabatan: CEO');
    doc.text('Kontak: 085174461775');
    addSpace();
    doc.font('Times-Bold').text('Pihak II');
    doc.font('Times-Roman').text(`Nama: ${mouData.nama2 || '-'}`);
    doc.text(`Instansi: ${mouData.instansi2 || '-'}`);
    doc.text(`Jabatan: ${mouData.jabatan2 || '-'}`);
    doc.text(`Kontak: ${mouData.kontak2 || '-'}`);
    addSpace();
    doc.font('Times-Bold').text('Nama Kegiatan:', { continued: true }).font('Times-Roman').text(` ${mouData.namaKegiatan || '-'}`);
    doc.font('Times-Bold').text('Hari/Tanggal:', { continued: true }).font('Times-Roman').text(` ${mouData.hariTanggal || '-'}`);
    doc.font('Times-Bold').text('Tempat:', { continued: true }).font('Times-Roman').text(` ${mouData.tempat || '-'}`);
    addSpace();
    doc.font('Times-Bold').text('Tanggal Penandatanganan:', { continued: true }).font('Times-Roman').text(` ${mouData.tanggalPenandatanganan || '-'}`);
    addSpace(2);
    doc.font('Times-Bold').text('Pasal 1');
    doc.font('Times-Bold').text('NAMA DAN WAKTU PELAKSANAAN');
    doc.font('Times-Roman').text('Pihak I dan Pihak II telah sepakat kerja sama dalam kegiatan yang telah disebutkan di atas.');
    addSpace();
    doc.font('Times-Bold').text('Pasal 2');
    doc.font('Times-Bold').text('PERATURAN KERJA SAMA');
    doc.font('Times-Roman').text('PENYEDIAAN BARANG DAN JASA');
    doc.list([
        'Barang yang dipinjamkan oleh Pihak I meliputi, perlengkapan yang diperlukan untuk kegiatan fotografi atau videografi.',
        'Jasa yang disediakan oleh Pihak I meliputi, tim produksi visual sesuai kebutuhan Pihak II.',
        'Pihak II wajib memberikan informasi yang jelas mengenai spesifikasi dan jumlah barang yang diperlukan serta jadwal penggunaan jasa fotografi atau videografi.',
        'Pihak II bertanggung jawab atas keamanan barang yang dipinjamkan selama masa peminjaman dan akan mengganti barang yang rusak atau hilang sesuai kesepakatan harga.',
        'Pihak I akan menyediakan barang dan jasa sesuai dengan spesifikasi yang telah disepakati dan dalam kondisi yang baik pada waktu peminjaman.',
        'Pihak II bertanggung jawab untuk menggunakan barang dan jasa sesuai dengan ketentuan yang telah disepakati dan tidak melakukan tindakan yang merusak atau mengubah barang tersebut tanpa izin dari Pihak I.',
        'Pembayaran sewa barang dan jasa akan dilakukan oleh Pihak II sesuai dengan tarif yang telah disepakati sebelum kegiatan dimulai.',
        'Pihak II wajib menyerahkan bukti pemesanan atau pembayaran setelah menerima barang atau menggunakan jasa untuk keperluan administrasi Pihak I.'
    ]);
    addSpace();
    doc.font('Times-Bold').text('Pasal 3');
    doc.font('Times-Bold').text('PENYELESAIAN PERSELISIHAN');
    doc.font('Times-Roman').text('Apabila terjadi suatu perselisihan antara Pihak I dan Pihak II sehubungan dengan pelaksanaan perjanjian kerjasama ini akan diselesaikan secara musyawarah mufakat oleh kedua belah pihak.');
    addSpace();
    doc.font('Times-Bold').text('Pasal 4');
    doc.font('Times-Bold').text('HAK CIPTA DAN PENGGUNAAN KONTEN');
    doc.font('Times-Roman').text('Semua hasil rekaman dan dokumentasi yang dihasilkan selama kegiatan, termasuk foto dan video, dapat digunakan oleh kedua belah pihak untuk keperluan promosi, dokumentasi, dan publikasi dengan tetap mencantumkan kredit kepada masing-masing pihak sesuai kontribusi.');
    addSpace();
    doc.font('Times-Bold').text('Pasal 5');
    doc.font('Times-Bold').text('KETENTUAN LAIN');
    doc.font('Times-Roman').text('Hal-hal lain yang berkenaan dengan perjanjian ini dan hal-hal lain yang belum diatur pada perjanjian ini akan dimusyawarahkan kedua belah pihak.');
    addSpace(2);
    doc.font('Times-Roman').text('Dengan ini Surat Perjanjian Kerjasama ini dibuat serta ditandatangani oleh kedua belah pihak.');
    addSpace(2);
    doc.text(`Padang, ${mouData.tanggalPenandatanganan || '-'}`);
    addSpace(2);
    doc.text('Pihak I,', { continued: true, width: 200 });
    doc.text('Pihak II,', { align: 'right' });
    addSpace(3);
    doc.text('Toni Windra', { continued: true, width: 200 });
    doc.text(mouData.nama3 || '-', { align: 'right' });
    doc.text('NIM.2111517002', { continued: true, width: 200 });
    doc.text(`NIM.${mouData.nim || '-'}`, { align: 'right' });
    doc.end();
    doc.pipe(res);
});

router.post('/status/:id/cancel', requireAuth, statusController.cancelOrder);
router.post('/status/:id/exchange', requireAuth, statusController.requestExchange);

module.exports = router;