const { Schema } = require("mongoose");

let location = new Schema(
  {
    coordinates: { type: [Number] },
    map_url: { type: String  },
  },
  { _id: false }
);

module.exports = { location };
