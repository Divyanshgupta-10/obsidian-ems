const employeeService = require('../services/employee.service');
const { success } = require('../utils/response');

class EmployeeController {
  async list(req, res, next) {
    try {
      const data = await employeeService.list(req.query);
      return success(res, data);
    } catch (err) { next(err); }
  }

  async get(req, res, next) {
    try {
      const data = await employeeService.get(req.params.id);
      return success(res, data);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = await employeeService.create(req.body);
      return success(res, data, 'Employee created', 201);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const data = await employeeService.update(req.params.id, req.body);
      return success(res, data, 'Employee updated');
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await employeeService.delete(req.params.id);
      return success(res, null, 'Employee deleted');
    } catch (err) { next(err); }
  }

  async departments(req, res, next) {
    try {
      const data = await employeeService.getDepartments();
      return success(res, data);
    } catch (err) { next(err); }
  }

  async leaveBalance(req, res, next) {
    try {
      const data = await employeeService.getLeaveBalance(req.params.id);
      return success(res, data);
    } catch (err) { next(err); }
  }

  async getAllSkills(req, res, next) {
    try {
      const data = await employeeService.getAllSkills();
      return success(res, data);
    } catch (err) { next(err); }
  }

  async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }
      
      const uploadedImages = [];
      for (const file of req.files) {
        // file.path contains 'uploads/filename.ext'
        const image = await employeeService.saveImage(req.params.id, file.originalname, file.path.replace(/\\/g, '/'));
        uploadedImages.push(image);
      }
      
      return success(res, uploadedImages, 'Images uploaded successfully', 201);
    } catch (err) { next(err); }
  }
}

module.exports = new EmployeeController();
