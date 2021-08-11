const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const customerShcema = new Schema({
  username: { type: String, required: true },
  address: { type: String, required: false },
  phone: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  //image: { type: String, required: true },
  //places: { type: String, required: true },
});

customerShcema.plugin(uniqueValidator);

module.exports = mongoose.model("Customer", customerShcema);
