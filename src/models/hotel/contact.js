const { Schema } = require("mongoose");

let contact = new Schema(
  {
    phone: { type: String },
    email: { type: String },
  },
  { _id: false }
);

module.exports = { contact };
