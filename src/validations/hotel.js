const Joi = require("joi");
const { addressValidationSchema } = require("./common");

// Review Schema Validation
const reviewValidationSchema = Joi.object({
  user: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().optional().allow(null, ""),
  createdAt: Joi.date().default(Date.now),
});

// Policies Schema Validation
const policiesValidationSchema = Joi.object({
  checkInTime: Joi.string().optional(),
  checkOutTime: Joi.string().optional(),
  cancellationPolicy: Joi.string().optional(),
  refundPolicy: Joi.string().optional(),
});

// Contact Schema Validation
const contactValidationSchema = Joi.object({
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
});

// Main Hotel Schema Validation
const hotelValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  address_list: addressValidationSchema.optional(),
  map_url: Joi.string().optional(),
  contact: contactValidationSchema.optional(),
  rooms: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string().trim()).optional(),
  overall_rating: Joi.number().min(0).max(5).default(0),
  reviews: Joi.array().items(reviewValidationSchema).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  policies: policiesValidationSchema.optional(),
  status: Joi.string().optional(),
});

const UpdateHotelSchema = Joi.object({
  name: Joi.string().required().trim().optional(),
  address_list: addressValidationSchema.optional(),
  map_url: Joi.string().optional(),
  contact: contactValidationSchema.optional(),
  amenities: Joi.array().items(Joi.string().trim()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  policies: policiesValidationSchema.optional(),
  status: Joi.string().optional(),
  oldImages: Joi.allow(),
});

module.exports = { hotelValidationSchema, UpdateHotelSchema };
