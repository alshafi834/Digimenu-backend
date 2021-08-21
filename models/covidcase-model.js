const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const covidcaseShcema = new Schema({
  userid: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  date: { type: Date, required: true },
});

covidcaseShcema.plugin(uniqueValidator);

module.exports = mongoose.model("Covidcase", covidcaseShcema);
