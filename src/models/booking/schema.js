const { Schema } = require("mongoose");
const { status } = require("./constants");

let schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  hotel: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  rooms: [
    {
      room: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  checkInDate: {
    type: Date,  // Date of check-in
    required: true,
  },
  checkOutDate: {
    type: Date,  // Date of check-out
    required: true,
  },
  status: {
    type: String,
    enum: status.enum,
    default: status.booked,
  },
}, {
  collection: "bookings",
  timestamps: {
    createdAt: "created",
    updatedAt: "modified",
  },
  autoCreate: false,
});

module.exports = { schema };
