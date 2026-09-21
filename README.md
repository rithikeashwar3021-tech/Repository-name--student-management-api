# Student Management REST API

A clean, modular, and production-quality backend REST API for Student Management built with **Node.js**, **Express.js**, and **Supabase PostgreSQL**.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** Supabase PostgreSQL
* **Language:** JavaScript
* **Architecture:** REST API (Layered: Routes $\rightarrow$ Controllers $\rightarrow$ Supabase Database Client)
* **Testing:** Jest + Supertest

---

## 📁 Project Structure

```
backend/
├── .env.example            # Template for required environment variables
├── .gitignore              # Ignores node_modules, .env, and logs
├── package.json            # Project dependencies and npm scripts
├── README.md               # Documentation and setup instructions
├── sql/
│   └── schema.sql          # PostgreSQL table DDL with constraints
├── src/
│   ├── app.js              # Express app initialization & middleware configuration
│   ├── server.js           # Entrypoint script starting the HTTP server
│   ├── config/
│   │   └── supabase.js     # Supabase client initialized via environment variables
│   ├── controllers/
│   │   └── studentController.js # CRUD handlers and Supabase queries
│   ├── middlewares/
│   │   ├── errorHandler.js # Centralized 404 & error-handling middleware
│   │   └── validate.js     # Request body and UUID parameter validation
│   └── routes/
│       └── studentRoutes.js# REST route definitions for /api/students
└── tests/
    └── student.test.js     # Test suite verifying validation and CRUD operations
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Log in to [Supabase](https://supabase.com) and create or open your project.
2. In the left sidebar, navigate to the **SQL Editor**.
3. Click **New Query**, copy and paste the contents of `sql/schema.sql`, and click **Run**:

```sql
-- Enable pgcrypto extension to support gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    year INT NOT NULL CHECK (year >= 1 AND year <= 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. Verify that the table `students` is visible under the **Table Editor**.

---

## ⚙️ Environment Configuration

1. In the root directory, create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Retrieve your Supabase credentials:
   - In your Supabase Dashboard, go to **Project Settings** (gear icon) $\rightarrow$ **API**.
   - Copy the **Project URL** and paste it as `SUPABASE_URL`.
   - Copy the **Project API Key** (`anon` / `public`) and paste it as `SUPABASE_ANON_KEY`.
3. Your `.env` should look like this:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key
   ```
> **Security Note:** `.env` is listed in `.gitignore` and must never be committed to source control.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Run in Production Mode
```bash
npm start
```

The server will start at `http://localhost:5000`.

### 4. Seed Test Data (Optional)
Populates your Supabase database with sample students:
```bash
npm run seed
```

### 5. Run Automated Tests
```bash
npm test
```

---

## 📡 API Endpoints

### Student Data Model
| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Unique student ID | Auto-generated primary key |
| `name` | `string` | Full name | Required |
| `rollNumber` | `string` | Unique roll number | Required, unique |
| `department` | `string` | Academic department | Required |
| `year` | `integer` | Current year of study | Required, between 1 and 4 |

---

### 1. Health Check
* **Method:** `GET`
* **URL:** `/api/health`
* **Description:** Verifies that the API service is active.

```bash
curl -X GET http://localhost:5000/api/health
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Student Management API is operational",
  "timestamp": "2026-09-21T13:25:00.000Z"
}
```

---

### 2. Create Student
* **Method:** `POST`
* **URL:** `/api/students`
* **Body:**
```json
{
  "name": "Jane Doe",
  "rollNumber": "CS2026-015",
  "department": "Computer Science",
  "year": 2
}
```

```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","rollNumber":"CS2026-015","department":"Computer Science","year":2}'
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": "e30fbb85-df8d-4e92-ba78-ef07bfb439e6",
    "name": "Jane Doe",
    "rollNumber": "CS2026-015",
    "department": "Computer Science",
    "year": 2
  }
}
```

---

### 3. Get All Students
* **Method:** `GET`
* **URL:** `/api/students`

```bash
curl -X GET http://localhost:5000/api/students
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "e30fbb85-df8d-4e92-ba78-ef07bfb439e6",
      "name": "Jane Doe",
      "rollNumber": "CS2026-015",
      "department": "Computer Science",
      "year": 2
    }
  ]
}
```

---

### 4. Get Student by ID
* **Method:** `GET`
* **URL:** `/api/students/:id`

```bash
curl -X GET http://localhost:5000/api/students/e30fbb85-df8d-4e92-ba78-ef07bfb439e6
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "e30fbb85-df8d-4e92-ba78-ef07bfb439e6",
    "name": "Jane Doe",
    "rollNumber": "CS2026-015",
    "department": "Computer Science",
    "year": 2
  }
}
```

---

### 5. Update Student
* **Method:** `PUT`
* **URL:** `/api/students/:id`
* **Body:**
```json
{
  "name": "Jane Doe",
  "rollNumber": "CS2026-015",
  "department": "Information Science",
  "year": 3
}
```

```bash
curl -X PUT http://localhost:5000/api/students/e30fbb85-df8d-4e92-ba78-ef07bfb439e6 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","rollNumber":"CS2026-015","department":"Information Science","year":3}'
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "id": "e30fbb85-df8d-4e92-ba78-ef07bfb439e6",
    "name": "Jane Doe",
    "rollNumber": "CS2026-015",
    "department": "Information Science",
    "year": 3
  }
}
```

---

### 6. Delete Student
* **Method:** `DELETE`
* **URL:** `/api/students/:id`

```bash
curl -X DELETE http://localhost:5000/api/students/e30fbb85-df8d-4e92-ba78-ef07bfb439e6
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

## 🛡️ Error Handling & Status Codes

The API returns consistent JSON errors:
* `400 Bad Request`: Validation failure (e.g., missing fields, `year` not between 1 and 4, invalid UUID format).
* `404 Not Found`: Target student record or endpoint does not exist.
* `409 Conflict`: Unique constraint violation when attempting to reuse an existing `rollNumber`.
* `500 Internal Server Error`: Server or database unexpected failure.
