const notifService = require('../services/notification.service');
const { success } = require('../utils/response');

class NotificationController {
  async list(req, res, next) {
    try {
      const data = await notifService.getForUser(req.user.id);
      const unread = await notifService.countUnread(req.user.id);
      return success(res, { notifications: data, unread });
    } catch (err) { next(err); }
  }

  async markRead(req, res, next) {
    try {
      const data = await notifService.markRead(req.params.id, req.user.id);
      return success(res, data, 'Notification marked as read');
    } catch (err) { next(err); }
  }
}

module.exports = new NotificationController();
