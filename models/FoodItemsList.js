const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model("FoodItem", foodItemSchema);
