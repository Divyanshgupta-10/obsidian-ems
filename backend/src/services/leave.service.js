const leaveRepo = require('../repositories/leave.repository');
const notifRepo = require('../repositories/notification.repository');
const { paginate, paginatedResponse } = require('../utils/pagination');

class LeaveService {
  async list({ user, page, limit, status }) {
    const { page: p, limit: l, offset } = paginate(page, limit);
    const employeeId = user.role === 'employee' ? user.id : null;
    const { data, total } = await leaveRepo.listWithDetails({ employeeId, status, limit: l, offset });
    return paginatedResponse(data, total, p, l);
  }

  async get(id) {
    const leave = await leaveRepo.findWithDetails(id);
    if (!leave) { const e = new Error('Leave not found'); e.name = 'NotFoundError'; throw e; }
    return leave;
  }

  async apply(employeeId, data) {
    const leave = await leaveRepo.create({
      employee_id: employeeId,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason,
      status: 'pending',
    });
    return leave;
  }

  async approve(id, approverId) {
    const leave = await leaveRepo.findById(id);
    if (!leave) { const e = new Error('Leave not found'); e.name = 'NotFoundError'; throw e; }
    if (leave.status !== 'pending') { const e = new Error('Leave is not pending'); e.name = 'ValidationError'; throw e; }

    const updated = await leaveRepo.update(id, {
      status: 'approved', approved_by: approverId, approved_at: new Date(),
    });

    await notifRepo.create(
      leave.employee_id,
      'Leave Approved ✅',
      `Your ${leave.leave_type} leave from ${leave.start_date} to ${leave.end_date} has been approved.`
    );
    return updated;
  }

  async reject(id, approverId) {
    const leave = await leaveRepo.findById(id);
    if (!leave) { const e = new Error('Leave not found'); e.name = 'NotFoundError'; throw e; }

    const updated = await leaveRepo.update(id, {
      status: 'rejected', approved_by: approverId, approved_at: new Date(),
    });

    await notifRepo.create(
      leave.employee_id,
      'Leave Rejected ❌',
      `Your ${leave.leave_type} leave request has been rejected.`
    );
    return updated;
  }
}

module.exports = new LeaveService();
