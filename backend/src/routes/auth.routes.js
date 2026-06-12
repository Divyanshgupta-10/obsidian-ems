const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { register, login } = require('../validators/auth.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

// ── Public ──────────────────────────────────────────────────────────
router.post('/login', validate(login), authController.login.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.get('/verify-reset-token/:token', authController.verifyResetToken.bind(authController));

// ── Admin-only: create accounts ──────────────────────────────────────
router.post('/register', authenticate, authorize(ROLES.ADMIN), validate(register), authController.register.bind(authController));

// ── Authenticated ────────────────────────────────────────────────────
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

module.exports = router;

