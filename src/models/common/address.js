const { Schema } = require("mongoose");

let address = new Schema({
	city: {
		type: String,
		required: true
	},
	state: {
		type: String,
		required: true
	},
	country: {
		type: String,
		required: true
	},
	zipcode: {
		type: String,
		required: true
	},
	landmark: {
		type: String
	},
	locality: {
		type: String,
		required: true
	},
}, { _id: false });

module.exports = { address };