const notifRepo = require('../repositories/notification.repository');

class NotificationService {
  async getForUser(userId) {
    return notifRepo.getForUser(userId);
  }
  async countUnread(userId) {
    return notifRepo.countUnread(userId);
  }
  async markRead(id, userId) {
    return notifRepo.markRead(id, userId);
  }
}

module.exports = new NotificationService();
