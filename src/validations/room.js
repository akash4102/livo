const Joi = require('joi');

const addRoomSchema = Joi.object({
    // hotel: Joi.string().required().regex(/^[a-fA-F0-9]{24}$/),
    _id: Joi.allow(),
    type: Joi.string().required(),
    description: Joi.string().allow(null, '').trim(),
    pricePerNight: Joi.number().required().min(0),
    status: Joi.string(),
    features: Joi.array().items(Joi.string().trim()).optional(),
    images: Joi.array().items(Joi.string().trim().uri()).optional(),
});

// Validation schema for updating room details
const updateRoomSchema = Joi.object({
    _id: Joi.allow(),
    hotel: Joi.string().required().regex(/^[a-fA-F0-9]{24}$/),
    created: Joi.allow(),
    modified: Joi.allow(),
    __v: Joi.allow(),
    type: Joi.string().optional(),
    description: Joi.string().allow(null, '').trim().optional(),
    pricePerNight: Joi.number().min(0).optional(),
    status: Joi.string().optional(),
    features: Joi.array().items(Joi.string().trim()).optional(),
    images: Joi.array().items(Joi.string().trim().uri()).optional(),
});

// Validation schema for deleting a room
const deleteRoomSchema = Joi.object({
    roomId: Joi.string().required().regex(/^[a-fA-F0-9]{24}$/),
});

module.exports = {
    addRoomSchema,
    updateRoomSchema,
    deleteRoomSchema
};
