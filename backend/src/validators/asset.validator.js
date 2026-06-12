const Joi = require('joi');

const createAsset = Joi.object({
  asset_code: Joi.string().max(50).required(),
  asset_name: Joi.string().max(200).required(),
  asset_type: Joi.string().max(100).required(),
  purchase_date: Joi.date().optional().allow(null),
  purchase_cost: Joi.number().min(0).optional().allow(null),
  status: Joi.string().valid('available', 'allocated', 'damaged', 'lost').default('available'),
});

const updateAsset = Joi.object({
  asset_name: Joi.string().max(200).optional(),
  asset_type: Joi.string().max(100).optional(),
  purchase_date: Joi.date().optional().allow(null),
  purchase_cost: Joi.number().min(0).optional().allow(null),
  status: Joi.string().valid('available', 'allocated', 'damaged', 'lost').optional(),
});

const allocateAsset = Joi.object({
  employee_id: Joi.number().integer().required(),
  allocated_date: Joi.date().optional(),
  return_date: Joi.date().optional().allow(null),
});

module.exports = { createAsset, updateAsset, allocateAsset };
