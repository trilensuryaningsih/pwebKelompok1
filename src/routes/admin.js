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
var pesananControllers = require('../controllers/admin/pesanan');

// GET Routes - Untuk menampilkan halaman
router.get('/', adminControllers.index);
router.delete('/api/hapus/:id', hapusControllers.deleteItemAPI);
router.get('/daftar', daftarControllers.showAllitemsPage);
router.get('/tambah', tambahControllers.tambah);

router.get('/api/items/:id', editControllers.getitemDetails); 
router.get('/edit', editControllers.edit);
router.get('/status', statusControllers.showAllitemsPage); 
router.get('/stok', stokControllers.showAllitemsPage);

// Pesanan page with fine management
router.get('/pesanan', pesananControllers.showPesananPage);

// Fine management routes (moved to pesanan controller)
router.get('/pesanan/fines/history', pesananControllers.getFineHistory);
router.patch('/pesanan/fines/:fineId/status', pesananControllers.updateFineStatus);

// Legacy fine routes (kept for backward compatibility)
router.get('/fines/history', statusControllers.getFineHistory);
router.get('/fines/history-page', statusControllers.renderFineHistoryPage);
router.patch('/fines/:fineId/status', statusControllers.updateFineStatus);

router.post('/tambah', upload.single('foto'), tambahControllers.createitems);
router.post('/edit/:id', upload.single('foto'), editControllers.updateitem);

module.exports = router;