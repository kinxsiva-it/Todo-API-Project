module.exports = `
CREATE TABLE IF NOT EXISTS activity_logs (
    id           SERIAL       PRIMARY KEY,
    user_id      INT          REFERENCES users(id) ON DELETE SET NULL,
    action       VARCHAR(255),
    entity       VARCHAR(100),
    entity_id    INT,
    details      JSONB,
    method       VARCHAR(50),
    url          VARCHAR(255),
    status_code  INT,
    request_body JSONB,
    username     VARCHAR(255),
    timestamp    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
`;