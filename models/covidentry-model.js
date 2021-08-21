const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const covidentryShcema = new Schema({
  name: { type: String, required: true },
  userid: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  restid: { type: mongoose.Types.ObjectId, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  entrytime: { type: Date, required: true },
  leavingtime: { type: Date, required: true },
});

covidentryShcema.plugin(uniqueValidator);

module.exports = mongoose.model("Covid", covidentryShcema);
