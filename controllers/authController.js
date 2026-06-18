const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { user_id: user.id, email: user.email, role: user.role }, 
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { user_id: user.id },
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password" });
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query("BEGIN");

    const newUserResult = await pool.query(
      "INSERT INTO users (email) VALUES ($1) RETURNING id, email, role, created_at",
      [email]
    );
    const newUser = newUserResult.rows[0];

    await pool.query(
      "INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)",
      [newUser.id, hashedPassword]
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
      return res.status(400).json({ error: "Please provide email and password" });
    }

    const userResult = await pool.query(
      `
      SELECT u.id, u.email, u.role, uc.password_hash 
      FROM users u
      JOIN user_credentials uc ON u.id = uc.user_id
      WHERE u.email = $1
    `,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 
    
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
    );

    res.cookie("token", accessToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const currentRefreshToken = req.cookies.refreshToken;
    if (!currentRefreshToken) {
      return res.status(401).json({ error: "Refresh Token not provided" });
    }

    const tokenResult = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [currentRefreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const decoded = jwt.verify(currentRefreshToken, process.env.JWT_REFRESH_SECRET);
    
    const userResult = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1", 
      [decoded.user_id]
    );
    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

module.exports = {
  register,
  login,
  refreshToken, 
};