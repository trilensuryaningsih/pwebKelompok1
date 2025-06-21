var express = require('express');
var router = express.Router();
var upload = require('../middleware/upload'); 

var adminControllers = require('../controllers/admin/index');
var daftarControllers = require('../controllers/admin/daftar');
var hapusControllers = require('../controllers/admin/hapus'); 
var editControllers = require('../controllers/admin/edit'); 
var statusControllers = require('../controllers/admin/status'); 
var stokControllers = require('../controllers/admin/stok');
var notifikasiControllers = require('../controllers/admin/notifikasiJasa');
var pjControllers = require('../controllers/admin/pj');
var itemControllers = require('../controllers/admin/item');
var repairControllers = require('../controllers/admin/repair');

// GET Routes - Untuk menampilkan halaman
router.get('/', adminControllers.index);
router.delete('/api/hapus/:id', hapusControllers.deleteItemAPI);

// Route untuk daftar, tambah, edit, status, stok, notifikasi (lama)
router.get('/daftar', daftarControllers.showAllitemsPage); 
router.get('/edit', editControllers.edit);
router.get('/status', statusControllers.showAllitemsPage); 
router.get('/stok', stokControllers.showAllitemsPage);
router.get('/notifikasi', notifikasiControllers.tampilkanForm);
router.post('/edit/:id', upload.single('foto'), editControllers.updateitem);
router.post('/notifikasi/kirim', notifikasiControllers.kirimNotifikasi);

// Route untuk fitur item (baru)
router.get('/items', itemControllers.showAllItemsPage);
router.get('/items/create', itemControllers.showCreateItemPage);
router.get('/api/items/:id', itemControllers.getItemDetails); 
router.get('/items/edit', editControllers.edit);
router.get('/items/status', statusControllers.showAllitemsPage); 
router.get('/items/stock', stokControllers.showAllitemsPage);
router.get('/items/detail/:id', itemControllers.showItemDetailPage);
router.get('/items/delete/:id', itemControllers.showDeleteItemPage);
// Route untuk konfirmasi hapus
router.get('/items/delete-confirmation/:id', hapusControllers.showDeleteConfirmation);
router.post('/items/create', upload.single('foto'), itemControllers.createItem);
router.post('/items/edit/:id', upload.single('foto'), itemControllers.updateItem);
router.post('/items/delete/:id', itemControllers.deleteItem);

// Routes untuk manajemen PJ
router.get('/pj', pjControllers.showPJPage);
router.get('/pj/create', pjControllers.showAddPJPage);
router.post('/pj', pjControllers.createPJ);
router.put('/pj/:id', pjControllers.updatePJ);
router.delete('/pj/:id', pjControllers.deletePJ);

// Routes untuk manajemen perbaikan
router.get('/repair', repairControllers.showRepairPage);
router.get('/repair/create', repairControllers.showCreateRepairPage);
router.post('/repair/create', repairControllers.createRepair);
router.post('/repair/:id/status', repairControllers.updateRepairStatus);
router.post('/repair/:id/delete', repairControllers.deleteRepair);

module.exports = router;