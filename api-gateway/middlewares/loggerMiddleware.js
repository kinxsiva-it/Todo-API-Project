const pool = require("../../todo-service/config/db");

const getAction = (method) => {
  const actions = {
    POST: "CREATE",
    GET: "READ",
    PUT: "UPDATE",
    PATCH: "UPDATE",
    DELETE: "DELETE",
  };
  return actions[method] || method;
};


const getEntity = (url) => {
  const parts = url.split("/").filter(Boolean);
  return parts[1] || null; 
};

const getEntityId = (url) => {
  const parts = url.split("/").filter(Boolean);
  const id = parts[2]; 
  return id && !isNaN(id) ? parseInt(id) : null;
};

const getDetails = (method, entity, entityId, statusCode) => {
  const action = getAction(method);
  const target = entityId ? `${entity} #${entityId}` : entity;
  const status = statusCode < 400 ? "success" : "failed";
  return { action, target, status, statusCode };
};

const loggerMiddleware = (req, res, next) => {
  const requestBody = req.body;

  const originalSend = res.send;
  res.send = function (data) {
    originalSend.call(this, data);

    const userId = req.user ? req.user.user_id : null;
    const username = req.user ? req.user.email : null;

    const action = getAction(req.method);
    const entity = getEntity(req.originalUrl);
    const entityId = getEntityId(req.originalUrl);
    const details = getDetails(req.method, entity, entityId, res.statusCode);

    const excludedUrls = ["/api/auth/login", "/api/auth/register"];
    if (excludedUrls.includes(req.originalUrl)) return;

    const query = `
      INSERT INTO activity_logs 
        (user_id, username, action, entity, entity_id, details, method, url, status_code, request_body)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    pool
      .query(query, [
        userId,
        username,
        action,
        entity,
        entityId,
        JSON.stringify(details),
        req.method,
        req.originalUrl,
        res.statusCode,
        JSON.stringify(requestBody || {}),
      ])
      .catch((err) => console.error("Audit Log Error:", err.message));
  };

  next();
};

module.exports = loggerMiddleware;