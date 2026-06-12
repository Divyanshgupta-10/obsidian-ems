const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asset.controller');
const validate = require('../middleware/validate.middleware');
const { createAsset, updateAsset, allocateAsset } = require('../validators/asset.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const auditLog = require('../middleware/audit.middleware');
const { ROLES } = require('../constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.list.bind(ctrl));
router.get('/employee/:employeeId', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.getEmployeeAssets.bind(ctrl));
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.get.bind(ctrl));
router.post('/', authorize(ROLES.ADMIN), validate(createAsset), auditLog('assets'), ctrl.create.bind(ctrl));
router.put('/:id', authorize(ROLES.ADMIN), validate(updateAsset), auditLog('assets'), ctrl.update.bind(ctrl));
router.post('/:id/allocate', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(allocateAsset), auditLog('assets'), ctrl.allocate.bind(ctrl));
router.post('/:id/return', authorize(ROLES.ADMIN, ROLES.MANAGER), auditLog('assets'), ctrl.returnAsset.bind(ctrl));

module.exports = router;
