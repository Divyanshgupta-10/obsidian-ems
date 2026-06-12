const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.list.bind(ctrl));
router.post('/:id/read', ctrl.markRead.bind(ctrl));

module.exports = router;
