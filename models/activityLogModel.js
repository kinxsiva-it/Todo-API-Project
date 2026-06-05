const createActivityLogsTableQuery = `
   CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    method VARCHAR(10),
    url TEXT,
    status_code INTEGER,
    request_body JSONB,      
    response_body JSONB,     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
module.exports = createActivityLogsTableQuery;