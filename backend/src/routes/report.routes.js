const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', ctrl.dashboard.bind(ctrl));
router.get('/employees', ctrl.employees.bind(ctrl));
router.get('/leaves', ctrl.leaves.bind(ctrl));
router.get('/assets', ctrl.assets.bind(ctrl));
router.get('/audit-logs', ctrl.auditLogs.bind(ctrl));

module.exports = router;
