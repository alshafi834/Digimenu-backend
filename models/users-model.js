const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const userShcema = new Schema({
  username: { type: String, required: true },
  address: { type: String, required: false },
  phone: { type: String, required: false },
  categories: [{ catName: String }],
  fooditems: [{ foodName: String, foodPrice: Number, foodCategory: String }],
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  //image: { type: String, required: true },
  //places: { type: String, required: true },
});

userShcema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userShcema);
