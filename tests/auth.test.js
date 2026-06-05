const request = require('supertest');
const { app, initializeDatabase } = require('../server'); 
const pool = require('../config/db');

beforeAll(async () => {
    await initializeDatabase();
});

afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    pool.end();
});

describe('Auth API', () => {
    const testUser = {
        email: `user_${Date.now()}@test.com`, 
        password: 'password123'
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message');
    });

    it('should login a user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send(testUser);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});

