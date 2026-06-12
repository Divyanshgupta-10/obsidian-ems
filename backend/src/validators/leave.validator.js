const Joi = require('joi');

const applyLeave = Joi.object({
  leave_type: Joi.string().valid('sick', 'casual', 'earned', 'maternity').required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required(),
  reason: Joi.string().min(5).max(500).required(),
});

module.exports = { applyLeave };
