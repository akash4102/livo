const Joi = require("joi");
const constants = require("../models/user/constants");

const userRegisterSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  role: Joi.string().default(constants.role.enum).optional(),
  status: Joi.string().optional().default(constants.status.active),
  password: Joi.string()
    .min(8)
    .required()
    .regex(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string()
    .min(8)
    .required()
    .regex(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(50).trim(),
  email: Joi.string().email().trim().lowercase(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .min(8)
    .max(100)
    .regex(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/),
  newPassword: Joi.string()
    .required()
    .min(8)
    .max(100)
    .regex(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/),
});

const createAdminSchema = Joi.object({
  userId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
  role: Joi.string().required(),
});

const blockUserSchema = Joi.object({
  userId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
  status: Joi.string().required(),
});

module.exports = {
  userRegisterSchema,
  userLoginSchema,
  updateProfileSchema,
  changePasswordSchema,
  createAdminSchema,
  blockUserSchema,
};
