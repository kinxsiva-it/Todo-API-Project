const request = require('supertest');
const { app, initializeDatabase } = require('../server'); 
const pool = require('../config/db');

beforeAll(async () => {
    await initializeDatabase();
});

let testTodoIds = [];

afterAll(async () => {
    try {
        if (testTodoIds.length > 0) {
            await pool.query(
                'DELETE FROM todos WHERE id = ANY($1)',
                [testTodoIds]
            );
        }
    } finally {
        await pool.end();
    }
});

describe('Todo API', () => {
    let token;
    let todoId;

    beforeAll(async () => {
        const user = {
            email: `user_${Date.now()}@test.com`,
            password: 'password123'
        };

        await request(app)
            .post('/api/auth/register')
            .send(user);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send(user);

        token = loginRes.body.token;

        const todoRes = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Todo' });

        todoId = todoRes.body.todo.id;
        testTodoIds.push(todoId);
    });

    it('should create a new todo', async () => {
        const res = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: `New Todo ${Date.now()}` });
            testTodoIds.push(res.body.todo.id);

        expect(res.statusCode).toBe(201);
        expect(res.body.todo).toHaveProperty('id');
    });

    it('should get all todos', async () => {
        const res = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get a todo by id', async () => {
        const res = await request(app)
            .get(`/api/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(todoId);
    });

    it('should update a todo', async () => {
        const res = await request(app)
            .put(`/api/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Todo',
                status: 'DONE'
            });

        expect(res.statusCode).toBe(200);
    });

    it('should delete a todo', async () => {
        const res = await request(app)
            .delete(`/api/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});
