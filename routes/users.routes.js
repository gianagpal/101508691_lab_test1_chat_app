const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Get all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ username: 1 });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get one user
router.get("/:username", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
