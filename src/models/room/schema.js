const { Schema } = require("mongoose");
const { status } = require("./constants");

const schema = new Schema(
  {
    hotel: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
    },
    bookings: [
      {
        checkInDate: Date,
        checkOutDate: Date,
        quantity: Number,  // Number of rooms booked for that date range
      },
    ],
    status: {
      type: String,
      enum: status.enum,
      default: status.available,
    },
    features: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
  },
  {
    collection: "rooms",
    timestamps: {
      createdAt: "created",
      updatedAt: "modified",
    },
    autoCreate: false,
  }
);

module.exports = { schema };
