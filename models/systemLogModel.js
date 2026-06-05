const createSystemLogsTableQuery = `
    CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NULL,
        level VARCHAR(50),
        message TEXT,
        method VARCHAR(10),
        url TEXT,
        stack_trace TEXT,
        request_body JSONB,      
        response_body JSONB,     
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

module.exports = createSystemLogsTableQuery;