const request = require('supertest');
const { app, initializeDatabase } = require('../../server'); 
const pool = require('../config/db');

// ประกาศตัวแปรไว้เก็บ CSRF สำหรับใช้ทุก Test
let csrfToken;
let csrfCookie;

beforeAll(async () => {
    await initializeDatabase();
    
    const csrfRes = await request(app).get('/api/csrf-token');
    csrfToken = csrfRes.body.csrfToken;
    csrfCookie = csrfRes.headers['set-cookie'];
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
            .set('X-CSRF-Token', csrfToken) 
            .set('Cookie', csrfCookie)      
            .send(testUser);
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message');
    });

    it('should login a user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .set('X-CSRF-Token', csrfToken) 
            .set('Cookie', csrfCookie)      
            .send(testUser);
        
        expect(res.statusCode).toBe(200);
        
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        
        const hasTokenCookie = cookies.some(cookie => cookie.includes('token='));
        expect(hasTokenCookie).toBe(true);
    });
});