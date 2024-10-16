const { address } = require("../common/address");
const { Schema } = require("mongoose");
const constants = require("./constants");
const { review } = require("./review");
const { policies } = require("./policies");
const { contact } = require("./contact");
const { string } = require("joi");

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address_list: {
    type: address,
  },
  map_url: {
    type: String,
  },
  contact: {
    type: contact
  },
  rooms: [
    {
      type: Schema.Types.ObjectId,
    },
  ],
  amenities: [
    {
      type: String,
    },
  ],
  overall_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [
    {
      type: review
    } 
  ],
  images: [
    {
      type: String,
    },
  ],
  policies: {
    type: policies
  },
  status: {
    type: String,
    enum: constants.hotel_status.enum,
    default: constants.hotel_status.active,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
  }
}, {
  collection: "hotels",
  timestamps: {
      createdAt: "created",
      updatedAt: "modified"
  },
  autoCreate: false,
});

schema.index({ "address_list.city": 1 });

module.exports = { schema };
