const express = require("express");
const multer = require("multer");
const Recipe = require("../models/Recipe");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Create a new recipe
router.post("/add", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, duration, ingredients, steps } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newRecipe = new Recipe({
      user: req.user.id,
      name,
      image,
      duration,
      ingredients: ingredients.split(","), // Convert comma-separated string to an array
      steps,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully!", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Fetch all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("user", "username");
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Fetch a single recipe by ID (Fix for RecipeDetails)
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching Recipe with ID:", req.params.id); // Debugging Log

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      console.log("Recipe not found in DB");
      return res.status(404).json({ message: "Recipe not found" });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error.message); // More detailed log
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ✅ Fetch recipes by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sharedRecipes = await Recipe.find({ user: userId });
    res.json({ sharedRecipes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Like a recipe
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (!recipe.likes.includes(req.user.id)) {
      recipe.likes.push(req.user.id);
      await recipe.save();
    }
    res.json({ message: "Recipe liked", recipe });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Save a recipe
router.post("/:id/save", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (!recipe.savedBy.includes(req.user.id)) {
      recipe.savedBy.push(req.user.id);
      await recipe.save();
    }
    res.json({ message: "Recipe saved", recipe });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// ✅ Fetch recipes by user ID (Make sure this returns both saved & liked recipes)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const sharedRecipes = await Recipe.find({ user: userId });
    const savedRecipes = await Recipe.find({ savedBy: userId });
    const likedRecipes = await Recipe.find({ likes: userId });

    res.json({ sharedRecipes, savedRecipes, likedRecipes }); 
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// ✅ Delete a recipe
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
