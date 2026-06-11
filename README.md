# Todo API Project
## 📝 Overview
ระบบ API สำหรับจัดการรายการงาน (Todo List) ที่ถูกออกแบบมาโดยเน้นความเป็นระเบียบ (Modular Design) และความปลอดภัยสูง รองรับการใช้งานในระดับทีมพัฒนาด้วยการทำเอกสาร API อัตโนมัติ

## 🏗️ Architecture
โปรเจกต์นี้ใช้สถาปัตยกรรมแบบแยกส่วน (Separation of Concerns):
- **Controllers**: จัดการ Business Logic
- **Routes**: กำหนดเส้นทาง API
- **Models**: จัดการโครงสร้างข้อมูลและติดต่อฐานข้อมูล
- **Middlewares**: จัดการความปลอดภัย (JWT, CSRF) และการทำ Activity Log

## 🚀 Key Features
- JWT Authentication via HttpOnly Cookies (ป้องกัน XSS)
- CSRF Token Protection (ป้องกัน Cross-Site Request Forgery)
- Todo CRUD Operations with Status Management (PENDING / IN_PROGRESS / DONE)
- Pagination, Search and Filtering
- Activity Logging — บันทึกทุก Request พร้อม action, entity, details ลง Database
- System Error Logging — บันทึก 500 errors พร้อม stack trace สำหรับ debug
- Swagger API Documentation
- Integration Testing with Jest & Supertest (100% Pass)

## 🛠️ Tech Stack
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon.tech Cloud)
- **Authentication**: JWT + HttpOnly Cookies + CSRF (csurf)
- **Documentation**: Swagger UI (OpenAPI 3.0)
- **Testing**: Jest + Supertest (Integration Testing)

## 📋 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL หรือ Neon.tech Cloud Database

## 📚 API Documentation
เข้าถึงเอกสาร API แบบ Interactive ได้ที่:
- **http://localhost:3000/api-docs**

> ⚠️ Swagger UI ถูก Exempt จาก CSRF Protection โดยอัตโนมัติ สามารถทดสอบ API ได้โดยตรง

## 📌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user (returns JWT via HttpOnly Cookie) |
| GET | /api/csrf-token | Get CSRF Token |

### Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/todos | Get all todos (pagination, search, filter by status) |
| GET | /api/todos/:id | Get todo by ID |
| POST | /api/todos | Create new todo |
| PUT | /api/todos/:id | Update todo (title + status) |
| DELETE | /api/todos/:id | Delete todo |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/logs/activity | Get activity logs |

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server Port (default: 3000) |
| DATABASE_URL | PostgreSQL Connection String |
| JWT_SECRET | Secret Key for JWT Signing |
| NODE_ENV | Environment (development / production) |

## 🗄️ Database Schema

### users

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| email | VARCHAR(255) | Unique User Email |
| created_at | TIMESTAMP | Account Creation Date |

---

### user_credentials
> แยกออกจาก users table เพื่อความปลอดภัยสูงสุด (Vertical Partitioning)
> ทำให้ SELECT * FROM users ไม่มีข้อมูล password ติดมาด้วยแม้จะถูก Hash แล้วก็ตาม

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| user_id | INT | Foreign Key → users.id |
| password_hash | VARCHAR(255) | Bcrypt Hashed Password |
| created_at | TIMESTAMP | Creation Date |

---

### todos

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| user_id | INT | Foreign Key → users.id |
| title | VARCHAR(255) | Todo Title |
| description | TEXT | Todo Description |
| status | VARCHAR(50) | PENDING / IN_PROGRESS / DONE |
| created_at | TIMESTAMP | Creation Date |
| updated_at | TIMESTAMP | Last Update Date |

---

### activity_logs
> บันทึกทุก Request เพื่อ Audit Trail — ใครทำอะไร กับอะไร ที่ไหน เมื่อไหร่

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| user_id | INT | Foreign Key → users.id (SET NULL on delete) |
| username | VARCHAR(255) | Email ของ User ที่ทำ Request |
| action | VARCHAR(255) | CREATE / READ / UPDATE / DELETE |
| entity | VARCHAR(100) | Target เช่น todos, logs |
| entity_id | INT | ID ของ record ที่ถูกกระทำ |
| details | JSONB | สรุป action, target, status, statusCode |
| method | VARCHAR(50) | HTTP Method (GET, POST, PUT, DELETE) |
| url | VARCHAR(255) | Request URL |
| status_code | INT | HTTP Response Status Code |
| request_body | JSONB | Request Payload |
| timestamp | TIMESTAMP | Log Timestamp |

---

### system_logs
> บันทึกเฉพาะ 500 Internal Server Error สำหรับ Developer ใช้ Debug

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| level | VARCHAR(50) | INFO / WARNING / ERROR |
| message | TEXT | Error Message |
| meta | JSONB | method, url, stack trace, request/response body |
| user_id | INT | User ที่ทำให้เกิด Error |
| method | VARCHAR(50) | HTTP Method ที่ทำให้เกิด Error |
| timestamp | TIMESTAMP | Log Timestamp |

## 🔒 Security Implementation

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcryptjs (salt rounds: 10) |
| Credential Isolation | Vertical Partitioning (users + user_credentials) |
| Authentication | JWT via HttpOnly Cookie |
| XSS Prevention | HttpOnly + Secure Cookie flags |
| CSRF Protection | csurf middleware (per-route, exempt Swagger) |
| CSRF Prevention | sameSite: strict |
| SQL Injection | Parameterized Queries |
| User Isolation | user_id scoped queries (ทุก endpoint) |

## 🧪 Testing

รันชุดทดสอบด้วยคำสั่ง:
```bash
npm test
```

ครอบคลุม:
- Auth: Register, Login (พร้อม CSRF Token + Cookie)
- Todos: Create, Read, Update, Delete, Pagination, Search, Filter by Status

## 📁 Project Structure
```
Todo-API-Project/
├── config/
│   └── db.js                    # Database connection pool (Neon.tech)
├── controllers/
│   ├── authController.js        # Register & Login with Transaction
│   ├── todoController.js        # Todo CRUD operations
│   └── logController.js         # Activity log retrieval
├── middlewares/
│   ├── authMiddleware.js        # JWT token verification
│   └── loggerMiddleware.js      # Activity logging (action, entity, details)
├── models/
│   ├── userModel.js             # Users table schema
│   ├── todoModel.js             # Todos table schema
│   ├── systemLogModel.js        # System logs table schema
│   └── activityLogModel.js      # Activity logs table schema
├── routes/
│   ├── authRoutes.js            # /api/auth/*
│   ├── todoRoutes.js            # /api/todos/*
│   └── logRoutes.js             # /api/logs/*
├── tests/
│   ├── auth.test.js             # Auth integration tests
│   └── todo.test.js             # Todo integration tests
├── postman/
│   └── TodoAPI.postman_collection.json
├── server.js                    # Main server setup
├── swagger.json                 # OpenAPI 3.0 documentation
└── README.md
```

## ⚙️ Installation

1. Clone Repository
```bash
git clone https://github.com/kinxsiva-it/Todo-API-Project.git
cd Todo-API-Project
```

2. Install Dependencies
```bash
npm install
```

3. Create Environment Variables
```env
PORT=3000
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
JWT_SECRET=your_secret_key
NODE_ENV=development
```

4. Start Server
```bash
node server.js
```

## 👨‍💻 Author

Pakin Bunthr

GitHub: https://github.com/kinxsiva-it