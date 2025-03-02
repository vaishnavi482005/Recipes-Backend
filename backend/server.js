require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");


const app = express();
app.use(express.json());
app.use(cors({ 
    origin: "*", // Allow all origins (for development)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Debugging: Check if environment variables are loaded
console.log("🔍 Connecting to MongoDB...");
console.log("MONGO_URI:", process.env.MONGO_URI);

// ✅ Improved MongoDB Connection Handling
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Stop server if MongoDB connection fails
    });

// ✅ Additional Debugging for Connection Events
mongoose.connection.on("error", err => console.error("⚠️ MongoDB Connection Error:", err));
mongoose.connection.on("disconnected", () => console.warn("⚠️ MongoDB Disconnected. Reconnecting..."));

// ✅ Import Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const recipeRoutes = require("./routes/recipes");
app.use("/api/recipes", recipeRoutes);

// ✅ Default Test Route
app.get("/", (req, res) => {
    res.send("✅ Server is running and connected to MongoDB!");
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
