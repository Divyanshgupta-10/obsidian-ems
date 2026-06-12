const authService = require('../services/auth.service');
const { success } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return success(res, user, 'Registration successful', 201);
    } catch (err) { next(err); }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body.email, req.body.password);
      return success(res, data, 'Login successful');
    } catch (err) { next(err); }
  }

  async logout(req, res) {
    return success(res, null, 'Logged out successfully');
  }

  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return success(res, user, 'Profile fetched');
    } catch (err) { next(err); }
  }

  async forgotPassword(req, res, next) {
    try {
      const data = await authService.forgotPassword(req.body.email);
      return success(res, data, data.message);
    } catch (err) { next(err); }
  }

  async resetPassword(req, res, next) {
    try {
      const data = await authService.resetPassword(req.body.token, req.body.password);
      return success(res, data, data.message);
    } catch (err) { next(err); }
  }

  async verifyResetToken(req, res, next) {
    try {
      const data = await authService.verifyResetToken(req.params.token);
      return success(res, data);
    } catch (err) { next(err); }
  }
}

module.exports = new AuthController();

