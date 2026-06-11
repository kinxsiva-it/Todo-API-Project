const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide both email and password" });
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query("BEGIN");

    const newUserResult = await pool.query(
      "INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at",
      [email],
    );
    const newUser = newUserResult.rows[0];

    await pool.query(
      "INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)",
      [newUser.id, hashedPassword],
    );

    await pool.query("COMMIT");

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    const userResult = await pool.query(
      `
      SELECT u.id, u.email, uc.password_hash 
      FROM users u
      JOIN user_credentials uc ON u.id = uc.user_id
      WHERE u.email = $1
    `,
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { user_id: user.id, email: user.email }, 
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
