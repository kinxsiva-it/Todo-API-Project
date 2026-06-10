# Todo API Project

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

## 📝 Overview
ระบบ API สำหรับจัดการรายการงาน (Todo List) ที่ถูกออกแบบมาโดยเน้นความเป็นระเบียบ (Modular Design) และความปลอดภัยสูง รองรับการใช้งานในระดับทีมพัฒนาด้วยการทำเอกสาร API อัตโนมัติ

## 🏗️ Architecture
โปรเจกต์นี้ใช้สถาปัตยกรรมแบบแยกส่วน (Separation of Concerns):
- **Controllers**: จัดการ Business Logic
- **Routes**: กำหนดเส้นทาง API
- **Models**: จัดการโครงสร้างข้อมูลและติดต่อฐานข้อมูล
- **Middlewares**: จัดการความปลอดภัย (JWT) และการทำ Log

## 🚀 Key Features
- JWT Authentication & Authorization
- Todo CRUD Operations
- Pagination, Search and Filtering
- Activity Logging
- System Error Logging
- Swagger API Documentation
- Integration Testing with Jest & Supertest

## 🛠️ Tech Stack
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Documentation**: Swagger UI (OpenAPI 3.0)
- **Testing**: Jest (Integration Testing)

## 📋 Getting Started
### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL

## 📚 API Documentation
### เข้าถึงเอกสาร API แบบ Interactive ได้ที่:
- **http://localhost:3000/api-docs**

## 📌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|----------|------------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |

### Todos

| Method | Endpoint | Description |
|----------|------------|-------------|
| GET | /api/todos | Get All Todos |
| GET | /api/todos/:id | Get Todo By ID |
| POST | /api/todos | Create Todo |
| PUT | /api/todos/:id | Update Todo |
| DELETE | /api/todos/:id | Delete Todo |

## 🔐 Environment Variables

| Variable | Description |
|-----------|-------------|
| PORT | Server Port |
| DB_USER | PostgreSQL Username |
| DB_PASSWORD | PostgreSQL Password |
| DB_HOST | Database Host |
| DB_PORT | Database Port |
| DB_NAME | Database Name |
| JWT_SECRET | Secret Key for JWT |

## 🗄️ Database Schema
### users

| Column | Type | Description |
|----------|----------|-------------|
| id | SERIAL | Primary Key |
| email | VARCHAR(255) | Unique User Email |
| password | VARCHAR(255) | Hashed Password |
| created_at | TIMESTAMP | Account Creation Date |

---

### todos

| Column | Type | Description |
|----------|----------|-------------|
| id | SERIAL | Primary Key |
| user_id | INT | Foreign Key → users.id |
| title | VARCHAR(255) | Todo Title |
| description | TEXT | Todo Description |
| status | VARCHAR(50) | PENDING / IN_PROGRESS / DONE |
| created_at | TIMESTAMP | Creation Date |
| updated_at | TIMESTAMP | Last Update Date |

---

### activity_logs

| Column | Type | Description |
|----------|----------|-------------|
| id | SERIAL | Primary Key |
| user_id | INT | User Performing Action |
| action | VARCHAR(255) | Action Name |
| entity | VARCHAR(100) | Target Entity |
| entity_id | INT | Entity Identifier |
| details | JSONB | Additional Information |
| timestamp | TIMESTAMP | Log Timestamp |

---

### system_logs

| Column | Type | Description |
|----------|----------|-------------|
| id | SERIAL | Primary Key |
| level | VARCHAR(50) | INFO / WARNING / ERROR |
| message | TEXT | Log Message |
| meta | JSONB | Extra Metadata |
| timestamp | TIMESTAMP | Log Timestamp |

## 🧪 Testing
### รันชุดทดสอบด้วยคำสั่ง:
```bash
npm test
```

## 📁 Project Structure
```text
todo-api/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── tests/
├── postman/
├── app.js
├── server.js
├── swagger.json
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
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
JWT_SECRET=your_secret_key
```

4. Start Server
```bash
node server.js
```


## 👨‍💻 Author

Pakin Bunthr

GitHub Profile: https://github.com/kinxsiva-it