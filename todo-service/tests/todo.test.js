const request = require("supertest");
const { app, initializeDatabase } = require("../../server");
const pool = require("../config/db");

beforeAll(async () => {
  await initializeDatabase();
});

let testTodoIds = [];

afterAll(async () => {
  try {
    if (testTodoIds.length > 0) {
      await pool.query("DELETE FROM todos WHERE id = ANY($1)", [testTodoIds]);
    }
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
  } finally {
    await pool.end();
  }
});

describe("Todo API", () => {
  let csrfToken;
  let csrfCookie;
  let combinedCookies = []; 
  let todoId;

  const regularUser = {
    email: `user_${Date.now()}@test.com`,
    password: "password123",
  };

  beforeAll(async () => {
    const csrfRes = await request(app).get("/api/csrf-token");
    csrfToken = csrfRes.body.csrfToken;
    csrfCookie = csrfRes.headers["set-cookie"] || [];

    await request(app)
      .post("/api/auth/register")
      .set("X-CSRF-Token", csrfToken)
      .set("Cookie", csrfCookie)
      .send(regularUser);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .set("Cookie", csrfCookie)
      .send(regularUser);

    const authCookie = loginRes.headers["set-cookie"] || [];
    combinedCookies = [...csrfCookie, ...authCookie];

    const todoRes = await request(app)
      .post("/api/todos")
      .set("X-CSRF-Token", csrfToken)
      .set("Cookie", combinedCookies)
      .send({ title: "Test Todo for RBAC" });
    
    todoId = todoRes.body.todo.id;
    testTodoIds.push(todoId);
  });

  it("should create a new todo", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set("X-CSRF-Token", csrfToken)
      .set("Cookie", combinedCookies)
      .send({ title: `New Todo ${Date.now()}` });

    testTodoIds.push(res.body.todo.id);
    expect(res.statusCode).toBe(201);
    expect(res.body.todo).toHaveProperty("id");
  });

  it("should get all todos", async () => {
    const res = await request(app)
      .get("/api/todos")
      .set("Cookie", combinedCookies);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get a todo by id", async () => {
    const res = await request(app)
      .get(`/api/todos/${todoId}`)
      .set("Cookie", combinedCookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(todoId);
  });

  it("should update a todo", async () => {
    const res = await request(app)
      .put(`/api/todos/${todoId}`)
      .set("X-CSRF-Token", csrfToken)
      .set("Cookie", combinedCookies)
      .send({ title: "Updated Todo", status: "DONE" });

    expect(res.statusCode).toBe(200);
  });

  it("should return 403 Forbidden when a regular user tries to delete a todo", async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set("X-CSRF-Token", csrfToken)
      .set("Cookie", combinedCookies);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden"); 
  });

  it("should allow an admin to delete a todo", async () => {
    const adminAgent = request.agent(app); 
    const adminEmail = `admin_${Date.now()}@test.com`;

    const csrfRes = await adminAgent.get("/api/csrf-token");
    const adminCsrfToken = csrfRes.body.csrfToken;

    await adminAgent
      .post("/api/auth/register")
      .set("X-CSRF-Token", adminCsrfToken)
      .send({ email: adminEmail, password: "password123" });

    await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [adminEmail]);

    await adminAgent
      .post("/api/auth/login")
      .set("X-CSRF-Token", adminCsrfToken)
      .send({ email: adminEmail, password: "password123" });

    const adminTodoRes = await adminAgent
      .post("/api/todos")
      .set("X-CSRF-Token", adminCsrfToken)
      .send({ title: "Admin Private Task" });
    
    const adminTodoId = adminTodoRes.body.todo.id;
    testTodoIds.push(adminTodoId); 

    const res = await adminAgent
      .delete(`/api/todos/${adminTodoId}`)
      .set("X-CSRF-Token", adminCsrfToken);

    expect(res.statusCode).toBe(200);
  });
});