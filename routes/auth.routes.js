const express = require("express");
const bcrypt = require("bcryptjs");
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

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      firstname,
      lastname,
      password: hashed
    });

    res.status(201).json({
      message: "Signup successful",
      user: { username: user.username }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { username: user.username }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
