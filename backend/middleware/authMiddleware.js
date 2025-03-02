const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  console.log("Received Token:", token);  // ✅ Debugging

  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const extractedToken = token.split(" ")[1];  // ✅ Extract correctly
    console.log("Extracted Token:", extractedToken); // ✅ Debugging

    const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err); // ✅ Debugging
    res.status(400).json({ message: "Invalid Token" });
  }
};
