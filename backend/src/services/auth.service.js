const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../../config/db');
const authRepo = require('../repositories/auth.repository');
const env = require('../config/env');

// ── Optional nodemailer (gracefully skip if not configured) ──────────
let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (env.mail && env.mail.user && env.mail.user !== 'your@email.com') {
    transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      auth: { user: env.mail.user, pass: env.mail.pass },
    });
  }
} catch (_) {}

class AuthService {
  async register(data) {
    const existing = await authRepo.findByEmail(data.email);
    if (existing) {
      const err = new Error('Email already registered'); err.name = 'ConflictError'; throw err;
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await authRepo.create({
      name: data.name, email: data.email, password: hashedPassword,
      role: data.role || 'employee',
    });
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(email, password) {
    const user = await authRepo.findByEmail(email);
    if (!user) { const e = new Error('Invalid credentials'); e.name = 'UnauthorizedError'; throw e; }
    if (!user.is_active) { const e = new Error('Account is inactive. Contact your admin.'); e.name = 'UnauthorizedError'; throw e; }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) { const e = new Error('Invalid credentials'); e.name = 'UnauthorizedError'; throw e; }

    const token = jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async getProfile(userId) {
    return authRepo.findById(userId);
  }

  // ── Forgot Password ─────────────────────────────────────────────────
  async forgotPassword(email) {
    const user = await authRepo.findByEmail(email);
    // Always return success message (security: don't reveal if email exists)
    if (!user) return { message: 'If this email is registered, a reset link has been sent.' };

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate previous tokens for this user
    await pool.query(
      `UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
      [user.id]
    );

    // Save new token
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Send email (if mail is configured)
    if (transporter) {
      await transporter.sendMail({
        from: env.mail.from || 'HRMS System <noreply@hrms.com>',
        to: user.email,
        subject: '🔐 HRMS Password Reset Request',
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;background:#16161d;color:#f1f1f5;padding:32px;border-radius:16px;border:1px solid rgba(255,255,255,0.07)">
            <h2 style="margin:0 0 8px">Password Reset Request</h2>
            <p style="color:#9999b5;margin:0 0 24px">Hi ${user.name}, we received a request to reset your password.</p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
            <p style="color:#5a5a7a;font-size:12px;margin-top:24px">This link expires in <strong>30 minutes</strong>. If you didn't request this, ignore this email.</p>
            <p style="color:#5a5a7a;font-size:11px">Or copy this link: ${resetLink}</p>
          </div>
        `,
      });
    } else {
      // In dev mode: log the reset link to console
      console.log('\n════════════════════════════════════════');
      console.log('🔐 PASSWORD RESET LINK (Dev Mode — Email not configured)');
      console.log(`👤 User: ${user.name} (${user.email})`);
      console.log(`🔗 Link: ${resetLink}`);
      console.log(`⏱️  Expires: ${expiresAt.toLocaleString()}`);
      console.log('════════════════════════════════════════\n');
    }

    return { message: 'If this email is registered, a reset link has been sent.' };
  }

  // ── Reset Password ──────────────────────────────────────────────────
  async resetPassword(token, newPassword) {
    // Find valid token
    const result = await pool.query(
      `SELECT pr.*, u.email, u.name FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token = $1 AND pr.used = FALSE AND pr.expires_at > NOW()`,
      [token]
    );

    if (!result.rows.length) {
      const e = new Error('Reset link is invalid or has expired. Please request a new one.');
      e.name = 'ValidationError';
      throw e;
    }

    const reset = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query(`UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`, [hashedPassword, reset.user_id]);

    // Mark token as used
    await pool.query(`UPDATE password_resets SET used = TRUE WHERE id = $1`, [reset.id]);

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }

  // ── Verify Reset Token (for UI validation) ──────────────────────────
  async verifyResetToken(token) {
    const result = await pool.query(
      `SELECT u.name, u.email FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token = $1 AND pr.used = FALSE AND pr.expires_at > NOW()`,
      [token]
    );
    if (!result.rows.length) {
      const e = new Error('This reset link is invalid or has expired.');
      e.name = 'ValidationError';
      throw e;
    }
    return { valid: true, name: result.rows[0].name };
  }
}

module.exports = new AuthService();

