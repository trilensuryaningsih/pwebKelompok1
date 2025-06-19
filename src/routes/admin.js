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
var notifikasiControllers = require('../controllers/admin/notifikasiJasa');

// GET Routes - Untuk menampilkan halaman
router.get('/', adminControllers.index);
router.delete('/api/hapus/:id', hapusControllers.deleteItemAPI);
router.get('/daftar', daftarControllers.showAllitemsPage); 
router.get('/tambah', tambahControllers.tambah);

router.get('/api/items/:id', editControllers.getitemDetails); 
router.get('/edit', editControllers.edit);
router.get('/status', statusControllers.showAllitemsPage); 
router.get('/stok', stokControllers.showAllitemsPage);
router.get('/notifikasi', notifikasiControllers.tampilkanForm);



router.post('/tambah', upload.single('foto'), tambahControllers.createitems);
router.post('/edit/:id', upload.single('foto'), editControllers.updateitem);
router.post('/notifikasi/kirim', notifikasiControllers.kirimNotifikasi);


module.exports = router;