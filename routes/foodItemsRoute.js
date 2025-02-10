const express = require("express");
const {
  getFoodItems,
  createFoodItem,
  upload,
  searchFoodItems,
  filterFoodItemsByCategory,
} = require("../controllers/foodItemController");

const router = express.Router();

router.get("/food-items", getFoodItems);
router.post("/food-items", upload, createFoodItem);
router.get("/search", searchFoodItems);
router.get("/filter", filterFoodItemsByCategory);

module.exports = router;
