const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leave.controller');
const validate = require('../middleware/validate.middleware');
const { applyLeave } = require('../validators/leave.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const auditLog = require('../middleware/audit.middleware');
const { ROLES } = require('../constants');

router.use(authenticate);

router.get('/', ctrl.list.bind(ctrl));
router.get('/:id', ctrl.get.bind(ctrl));
router.post('/', validate(applyLeave), auditLog('leaves'), ctrl.apply.bind(ctrl));
router.put('/:id/approve', authorize(ROLES.ADMIN, ROLES.MANAGER), auditLog('leaves'), ctrl.approve.bind(ctrl));
router.put('/:id/reject', authorize(ROLES.ADMIN, ROLES.MANAGER), auditLog('leaves'), ctrl.reject.bind(ctrl));

module.exports = router;
