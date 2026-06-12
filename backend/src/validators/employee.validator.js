const Joi = require('joi');

const createEmployee = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'employee').default('employee'),
  department_id: Joi.number().integer().optional(),
  designation: Joi.string().max(200).optional(),
  salary: Joi.number().min(0).optional(),
  phone: Joi.string().max(20).optional(),
  address: Joi.string().optional(),
  joining_date: Joi.date().optional(),
});

const updateEmployee = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'manager', 'employee').optional(),
  department_id: Joi.number().integer().optional().allow(null),
  designation: Joi.string().max(200).optional().allow('', null),
  salary: Joi.number().min(0).optional().allow(null),
  phone: Joi.string().max(20).optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  joining_date: Joi.date().optional().allow(null),
  is_active: Joi.boolean().optional(),
});

module.exports = { createEmployee, updateEmployee };
