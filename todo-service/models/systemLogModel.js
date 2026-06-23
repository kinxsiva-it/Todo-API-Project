module.exports = `
CREATE TABLE IF NOT EXISTS system_logs (
    id        SERIAL      PRIMARY KEY,
    level     VARCHAR(50) NOT NULL,
    message   TEXT        NOT NULL,
    meta      JSONB,
    timestamp TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    user_id   INT,
    method    VARCHAR(50)
);
`;