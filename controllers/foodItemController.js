const FoodItemsList = require("../models/FoodItemsList");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

exports.upload = multer({ storage }).single("image");

// Combined API for getting, searching, and filtering food items
exports.getFoodItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      restaurantId, // Required parameter
    } = req.query;

    // Check if restaurantId is provided
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: "Restaurant ID is required",
      });
    }

    // Build query object starting with restaurantId
    let query = { restaurantId }; // Always filter by restaurant

    // Add search condition if search term provided
    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }

    // Add category filter if categories provided
    if (category) {
      const categories = category.split(",").map((cat) => cat.trim());
      query.category = { $in: categories };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [foodItems, totalItems] = await Promise.all([
      FoodItemsList.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-__v")
        .lean(),
      FoodItemsList.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    // Return response
    res.status(200).json({
      success: true,
      foodItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
      },
      filters: {
        search: search || null,
        categories: category ? category.split(",") : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch food items",
      details: error.message,
    });
  }
};

// Create food item with optimized image upload
exports.createFoodItem = async (req, res) => {
  try {
    const { name, price, description, category, restaurantId, available } =
      req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Image file is required",
      });
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: "Restaurant ID is required",
      });
    }

    // Upload image to cloudinary with optimized settings
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: `food-items/${restaurantId}`,
      public_id: `${Date.now()}-${file.originalname}`,
      resource_type: "image",
      quality: "auto", // Automatic quality optimization
      fetch_format: "auto", // Automatic format optimization
      width: 800, // Reasonable max width
      height: 800, // Reasonable max height
      crop: "limit", // Maintain aspect ratio
    });

    // Create food item
    const newFoodItem = await FoodItemsList.create({
      name,
      price,
      description,
      category,
      restaurantId,
      available,
      image: uploadResult.secure_url,
    });

    res.status(201).json({
      success: true,
      foodItem: newFoodItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create food item",
      details: error.message,
    });
  }
};

exports.searchFoodItems = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }

    const foodItems = await FoodItemsList.find({
      name: { $regex: new RegExp(name, "i") }, // Case-insensitive search
    });

    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// exports.filterFoodItemsByCategory = async (req, res) => {
//   try {
//     const { category, page = 1, limit = 10 } = req.query;

//     if (!category) {
//       return res
//         .status(400)
//         .json({ message: "Category query parameter is required" });
//     }

//     // Convert comma-separated string to an array
//     const categoryArray = category.split(",").map((cat) => cat.trim());

//     // Calculate skip value for pagination
//     const skip = (page - 1) * limit;

//     // Find food items that match the categories and apply pagination
//     const foodItems = await FoodItemsList.find({
//       category: { $in: categoryArray },
//     })
//       .skip(skip)
//       .limit(parseInt(limit));

//     // Count total items that match the categories
//     const totalItems = await FoodItemsList.countDocuments({
//       category: { $in: categoryArray },
//     });

//     // Calculate total pages
//     const totalPages = Math.ceil(totalItems / limit);

//     res.status(200).json({
//       foodItems,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages,
//         totalItems,
//         itemsPerPage: parseInt(limit),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

exports.filterFoodItemsByCategory = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    let query = {}; // Default query to fetch all data
    if (category) {
      // If category is provided, filter by categories
      const categoryArray = category.split(",").map((cat) => cat.trim());
      query = { category: { $in: categoryArray } };
    }

    // Find food items based on the query and apply pagination
    const foodItems = await FoodItemsList.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    // Count total items based on the query
    const totalItems = await FoodItemsList.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      foodItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
