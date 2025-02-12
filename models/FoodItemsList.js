const mongoose = require("mongoose");

const foodItemsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true },
    image: { type: String, required: true },
    restaurantId: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
foodItemsSchema.index({ name: "text" });
foodItemsSchema.index({ category: 1 });
foodItemsSchema.index({ restaurantId: 1 });

module.exports = mongoose.model("FoodItemsList", foodItemsSchema);
