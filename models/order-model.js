const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const orderShcema = new Schema({
  fooditems: [
    {
      foodName: String,
      foodPrice: Number,
      foodImage: String,
      foodCategory: String,
      quantity: Number,
      qPrice: Number,
    },
  ],
  totalprice: { type: Number, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  createdfor: { type: mongoose.Types.ObjectId, required: true },
  orderdate: { type: Date, required: true },
  status: {
    type: Number,
    enum: [0, 1, 2, 3],
  },
});

orderShcema.plugin(uniqueValidator);

module.exports = mongoose.model("Order", orderShcema);
