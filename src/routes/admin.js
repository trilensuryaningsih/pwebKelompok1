var express = require('express');
var router = express.Router();
var upload = require('../middleware/upload'); 

var adminControllers = require('../controllers/admin/index');
var daftarControllers = require('../controllers/admin/daftar');
var tambahControllers = require('../controllers/admin/tambah');
var hapusControllers = require('../controllers/admin/hapus'); 
var editControllers = require('../controllers/admin/edit'); 
var statusControllers = require('../controllers/admin/status'); 
var stokControllers = require('../controllers/admin/stok');
var pjControllers = require('../controllers/admin/pj');
var itemControllers = require('../controllers/admin/item');
var verificationControllers = require('../controllers/admin/verification');

// GET Routes - Untuk menampilkan halaman
router.get('/', adminControllers.index);
router.delete('/api/hapus/:id', hapusControllers.deleteItemAPI);
router.get('/items', itemControllers.showAllItemsPage);
router.get('/items/create', tambahControllers.tambah);

router.get('/api/items/:id', itemControllers.getItemDetails); 
router.get('/items/edit', editControllers.edit);
router.get('/items/status', statusControllers.showAllitemsPage); 
router.get('/items/stock', stokControllers.showAllitemsPage);
router.get('/items/verification', verificationControllers.showPendingOrdersPage);
router.get('/items/pesanan', itemControllers.showAllOrdersPage);

router.post('/items/create', upload.single('foto'), itemControllers.createItem);
router.post('/items/edit/:id', upload.single('foto'), itemControllers.updateItem);
router.post('/items/delete/:id', itemControllers.deleteItem);

// Routes untuk manajemen PJ
router.get('/pj', pjControllers.showPJPage);
router.get('/pj/create', pjControllers.showAddPJPage);
router.post('/pj', pjControllers.createPJ);
router.put('/pj/:id', pjControllers.updatePJ);
router.delete('/pj/:id', pjControllers.deletePJ);

// Routes untuk verifikasi pesanan
router.post('/items/verification/:id/approve', verificationControllers.approveOrder);
router.post('/items/verification/:id/reject', verificationControllers.rejectOrder);

module.exports = router;