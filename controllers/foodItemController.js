const FoodItemsList = require("../models/FoodItemsList");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

exports.getFoodItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not specified
    const skip = (page - 1) * limit;

    const foodItems = await FoodItemsList.find().skip(skip).limit(limit);

    const totalItems = await FoodItemsList.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      foodItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files temporarily in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

exports.createFoodItem = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const file = req.file; // Uploaded image file

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "food-items",
      public_id: Date.now() + "-" + file.originalname,
      resource_type: "image",
    });

    // Create food item with Cloudinary image URL
    const newFoodItem = new FoodItemsList({
      name,
      price,
      description,
      category,
      image: uploadResult.secure_url, // Cloudinary image URL
    });

    await newFoodItem.save();
    res.status(201).json(newFoodItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export Multer Middleware for Routes
exports.upload = upload.single("image");

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
