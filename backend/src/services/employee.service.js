const bcrypt = require('bcrypt');
const employeeRepo = require('../repositories/employee.repository');
const { paginate, paginatedResponse } = require('../utils/pagination');
const cache = require('../utils/cache');

class EmployeeService {
  async list({ page, limit, search }) {
    const { page: p, limit: l, offset } = paginate(page, limit);
    const { data, total } = await employeeRepo.listWithProfiles({ search, limit: l, offset });
    return paginatedResponse(data, total, p, l);
  }

  async get(id) {
    const emp = await employeeRepo.findWithProfile(id);
    if (!emp) { const e = new Error('Employee not found'); e.name = 'NotFoundError'; throw e; }
    
    // Fetch skills and images
    emp.skills = await employeeRepo.getEmployeeSkills(id);
    emp.images = await employeeRepo.getEmployeeImages(id);
    
    return emp;
  }

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await employeeRepo.create({
      name: data.name, email: data.email,
      password: hashedPassword, role: data.role || 'employee',
    });

    if (data.department_id || data.designation || data.salary) {
      await employeeRepo.upsertProfile(user.id, {
        department_id: data.department_id,
        designation: data.designation,
        salary: data.salary,
        phone: data.phone,
        address: data.address,
        joining_date: data.joining_date,
      });
    }
    
    if (data.skills && Array.isArray(data.skills)) {
      await employeeRepo.assignSkills(user.id, data.skills);
    }

    cache.del('departments');
    return this.get(user.id);
  }

  async update(id, data) {
    const emp = await employeeRepo.findById(id);
    if (!emp) { const e = new Error('Employee not found'); e.name = 'NotFoundError'; throw e; }

    const userFields = {};
    if (data.name) userFields.name = data.name;
    if (data.email) userFields.email = data.email;
    if (data.role) userFields.role = data.role;
    if (typeof data.is_active !== 'undefined') userFields.is_active = data.is_active;

    if (Object.keys(userFields).length) await employeeRepo.update(id, userFields);

    const profileFields = ['department_id', 'designation', 'salary', 'phone', 'address', 'joining_date'];
    const hasProfile = profileFields.some((f) => typeof data[f] !== 'undefined');
    if (hasProfile) {
      const profileData = {};
      profileFields.forEach((f) => { if (typeof data[f] !== 'undefined') profileData[f] = data[f]; });
      await employeeRepo.upsertProfile(id, profileData);
    }
    
    if (data.skills && Array.isArray(data.skills)) {
      await employeeRepo.assignSkills(id, data.skills);
    }

    return this.get(id);
  }

  async delete(id) {
    const emp = await employeeRepo.findById(id);
    if (!emp) { const e = new Error('Employee not found'); e.name = 'NotFoundError'; throw e; }
    return employeeRepo.delete(id);
  }

  async getDepartments() {
    const cached = cache.get('departments');
    if (cached) return cached;
    const depts = await employeeRepo.getDepartments();
    cache.set('departments', depts);
    return depts;
  }

  async getLeaveBalance(id) {
    return employeeRepo.getLeaveBalance(id);
  }

  async getAllSkills() {
    return employeeRepo.getAllSkills();
  }

  async saveImage(id, filename, filepath) {
    return employeeRepo.saveImage(id, filename, filepath);
  }
}

module.exports = new EmployeeService();
