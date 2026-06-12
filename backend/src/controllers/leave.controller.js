const leaveService = require('../services/leave.service');
const { success } = require('../utils/response');

class LeaveController {
  async list(req, res, next) {
    try {
      const data = await leaveService.list({ ...req.query, user: req.user });
      return success(res, data);
    } catch (err) { next(err); }
  }

  async get(req, res, next) {
    try {
      const data = await leaveService.get(req.params.id);
      return success(res, data);
    } catch (err) { next(err); }
  }

  async apply(req, res, next) {
    try {
      const data = await leaveService.apply(req.user.id, req.body);
      return success(res, data, 'Leave applied successfully', 201);
    } catch (err) { next(err); }
  }

  async approve(req, res, next) {
    try {
      const data = await leaveService.approve(req.params.id, req.user.id);
      return success(res, data, 'Leave approved');
    } catch (err) { next(err); }
  }

  async reject(req, res, next) {
    try {
      const data = await leaveService.reject(req.params.id, req.user.id);
      return success(res, data, 'Leave rejected');
    } catch (err) { next(err); }
  }
}

module.exports = new LeaveController();
