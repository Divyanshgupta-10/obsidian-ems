const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────
// POST /api/auth/signup
// Registers a new user
// ─────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if email already registered
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert user into DB
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User Registered Successfully!",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────
// POST /api/auth/login
// Authenticates a user and returns a JWT
// ─────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    // 3. Sign JWT token (expires in 1 day)
    const token = jwt.sign(
      { id: user.rows[0].id, name: user.rows[0].name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successful!",
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
