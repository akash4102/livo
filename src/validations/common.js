const Joi = require('joi');

const addressValidationSchema = Joi.object({
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipcode: Joi.string().required(),
  landmark: Joi.string().optional(),
  locality: Joi.string().required(),
});

module.exports = { addressValidationSchema };