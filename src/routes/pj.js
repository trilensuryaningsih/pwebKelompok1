const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const repairControllers = require('../controllers/pj/repair');
const indexControllers = require('../controllers/pj/index');
const itemsControllers = require('../controllers/pj/items');
const servicesControllers = require('../controllers/pj/services');
const reportsControllers = require('../controllers/pj/reports');

// Apply authentication middleware to all PJ routes
router.use(requireAuth);
router.use(requireRole(['pj']));

// Dashboard PJ
router.get('/', indexControllers.showDashboard);

// Routes untuk verifikasi perbaikan oleh PJ
router.get('/repair', repairControllers.showRepairPage);
router.post('/repair/:id/verify', repairControllers.verifyRepair);
router.post('/repair/:id/start', repairControllers.startRepair);
router.post('/repair/:id/complete', repairControllers.completeRepair);

// Routes untuk manajemen alat oleh PJ
router.get('/items', itemsControllers.showItems);
router.get('/items/add', itemsControllers.showAddItem);
router.post('/items/add', itemsControllers.addItem);
router.get('/items/:id', itemsControllers.showItemDetail);

// Routes untuk melihat jasa oleh PJ
router.get('/services', servicesControllers.showServices);
router.get('/services/:id', servicesControllers.showServiceDetail);

// Routes untuk generate laporan
router.get('/reports/generate', reportsControllers.generateReport);

module.exports = router; 