const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const employeeRoutes = require('./employee.routes');
const leaveRoutes = require('./leave.routes');
const assetRoutes = require('./asset.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');

router.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString(), version: 'v1' });
});

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/leaves', leaveRoutes);
router.use('/assets', assetRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
