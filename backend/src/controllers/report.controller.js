const reportService = require('../services/report.service');
const { success } = require('../utils/response');

class ReportController {
  async dashboard(req, res, next) {
    try {
      return success(res, await reportService.dashboard());
    } catch (err) { next(err); }
  }

  async employees(req, res, next) {
    try {
      const data = await reportService.employeeReport();
      if (req.query.format === 'excel') {
        const buffer = reportService.toExcel(data, 'Employees');
        res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.send(buffer);
      }
      return success(res, data);
    } catch (err) { next(err); }
  }

  async leaves(req, res, next) {
    try {
      const data = await reportService.leaveReport();
      if (req.query.format === 'excel') {
        const buffer = reportService.toExcel(data, 'Leaves');
        res.setHeader('Content-Disposition', 'attachment; filename=leaves.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.send(buffer);
      }
      return success(res, data);
    } catch (err) { next(err); }
  }

  async assets(req, res, next) {
    try {
      const data = await reportService.assetReport();
      if (req.query.format === 'excel') {
        const buffer = reportService.toExcel(data, 'Assets');
        res.setHeader('Content-Disposition', 'attachment; filename=assets.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.send(buffer);
      }
      return success(res, data);
    } catch (err) { next(err); }
  }

  async auditLogs(req, res, next) {
    try {
      return success(res, await reportService.auditLogs(req.query));
    } catch (err) { next(err); }
  }
}

module.exports = new ReportController();
