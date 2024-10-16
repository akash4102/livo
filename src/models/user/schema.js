const { Schema } = require("mongoose");
const constants = require("./constants");
// const { address } = require("../common/address");

let schema = new Schema({
    name: {
        type: String,
        minlength: 1,
        maxlength: 50,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: constants.role.enum,
        default: constants.role.user
    },
    status: {
        type: String,
        required: true,
        default: constants.status.pending,
        enum: constants.status.enum
    },
    password: {
        type: String,
        // required: true,
        bcrypt: true
    },
    bookings: [{
        type: Schema.Types.ObjectId,
    }],
}, {
    collection: "users",
    timestamps: {
        createdAt: "created",
        updatedAt: "modified"
    },
    autoCreate: false,
});

schema.plugin(require('mongoose-bcrypt'));

module.exports = {
    schema
};