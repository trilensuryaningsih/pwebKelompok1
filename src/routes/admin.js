var express = require('express');
var router = express.Router();
var upload = require('../middleware/upload'); 

var adminControllers = require('../controllers/admin/index');
var daftarControllers = require('../controllers/admin/daftar');
var tambahControllers = require('../controllers/admin/tambah');
var hapusControllers = require('../controllers/admin/hapus'); 
var editControllers = require('../controllers/admin/edit');   

// GET Routes - Untuk menampilkan halaman
router.get('/', adminControllers.index);
router.get('/daftar', daftarControllers.showAllitemsPage); //
router.get('/tambah', tambahControllers.tambah);
router.get('/hapus', hapusControllers.hapus); 
router.get('/edit', editControllers.edit);   


router.post('/tambah', upload.single('foto'), tambahControllers.createitem);


module.exports = router;