const { error } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error: err } = schema.validate(req.body, { abortEarly: false });
  if (err) {
    const errors = err.details.map((d) => d.message);
    return error(res, 'Validation failed', 422, errors);
  }
  next();
};

module.exports = validate;
