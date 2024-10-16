const Joi = require("joi");

const bookHotelSchema = Joi.object({
  rooms: Joi.array()
    .items(
      Joi.object({
        room: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
        quantity: Joi.number().integer().min(1).required(),
        hotelId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
      })
    )
    .min(1)
    .required()
    .label("Rooms"),
  checkInDate: Joi.date().iso().required().label("Check-In Date"),
  checkOutDate: Joi.date().iso().greater(Joi.ref("checkInDate")).required().label("Check-Out Date"),
});


module.exports = { bookHotelSchema };
