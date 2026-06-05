const pool = require("../config/db");

const loggerMiddleware = (req, res, next) => {
  const requestBody = req.body;

  const originalSend = res.send;
  res.send = function (data) {
    let responseBody = null;
    try {
      responseBody = data ? JSON.parse(data) : null;
    } catch (e) {
      responseBody = data;
    }

    originalSend.call(this, data);

    const userId = req.user ? req.user.user_id : null;

    if (
      req.originalUrl !== "/api/auth/login" &&
      req.originalUrl !== "/api/auth/register"
    ) {
      const query = `
                INSERT INTO activity_logs (user_id, method, url, status_code, request_body, response_body)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;

      pool
        .query(query, [
          userId,
          req.method,
          req.originalUrl,
          res.statusCode,
          JSON.stringify(requestBody || {}), 
          JSON.stringify(responseBody || {}),
        ])
        .catch((err) => console.error("Audit Log Error:", err.message));
    }
  };

  next();
};

module.exports = loggerMiddleware;
