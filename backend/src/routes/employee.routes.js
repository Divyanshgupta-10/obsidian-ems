const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employee.controller');
const validate = require('../middleware/validate.middleware');
const { createEmployee, updateEmployee } = require('../validators/employee.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const auditLog = require('../middleware/audit.middleware');
const upload = require('../middleware/upload.middleware');
const { ROLES } = require('../constants');

router.use(authenticate);

router.get('/skills', ctrl.getAllSkills.bind(ctrl));
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.list.bind(ctrl));
router.get('/departments', ctrl.departments.bind(ctrl));
router.get('/:id/leave-balance', ctrl.leaveBalance.bind(ctrl));
router.get('/:id', ctrl.get.bind(ctrl));

router.post('/:id/images', authorize(ROLES.ADMIN, ROLES.MANAGER), upload.array('images', 5), auditLog('users'), ctrl.uploadImages.bind(ctrl));

router.post('/', authorize(ROLES.ADMIN), validate(createEmployee), auditLog('users'), ctrl.create.bind(ctrl));
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(updateEmployee), auditLog('users'), ctrl.update.bind(ctrl));
router.delete('/:id', authorize(ROLES.ADMIN), auditLog('users'), ctrl.delete.bind(ctrl));

module.exports = router;
