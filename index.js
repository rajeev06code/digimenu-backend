const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const qrCodeRoutes = require("./routes/qrCodeRoutes");
const foodItemRoutes = require("./routes/foodItemsRoute");
const app = express();
const port = 3000;
app.use(cors());
const allowedOrigins = [
  "http://localhost:5173",
  "https://9699-2401-4900-3b1c-602d-3978-1841-f496-3b3.ngrok-free.app",
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
connectDB();

app.use(express.json());

app.use("/api", qrCodeRoutes);
app.use("/api", foodItemRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
