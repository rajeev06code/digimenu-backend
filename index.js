const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const qrCodeRoutes = require("./routes/qrCodeRoutes");
const foodItemRoutes = require("./routes/foodItemsRoute");
const QRcode = require("./models/QRcode");

const app = express();
const port = 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://digimenu-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Connect to database and handle index
const initializeDB = async () => {
  await connectDB();

  try {
    // Drop the problematic index
    await QRcode.collection.dropIndex("restaurantName_1");
    console.log("Old index dropped successfully");
  } catch (err) {
    // Index might not exist, that's okay
    console.log("Note: Index drop attempted");
  }
};

initializeDB()
  .then(() => {
    app.use(express.json());

    app.use("/api", qrCodeRoutes);
    app.use("/api", foodItemRoutes);

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
