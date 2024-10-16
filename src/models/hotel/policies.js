const { Schema } = require("mongoose");

let policies = new Schema({
    checkInTime: {
        type: String,
    },
    checkOutTime: {
        type: String,
    },
    cancellationPolicy: {
        type: String,
    },
    refundPolicy: {
        type: String,
    },
}, { _id: false });

module.exports = { policies };