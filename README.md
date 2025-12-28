# appsec-lab-app-a

A security-focused Node.js application designed as a **learning and testing lab** for application security (AppSec) and penetration testing concepts.

This project intentionally mirrors real-world backend architectures (auth, RBAC, ownership, sessions) so that security vulnerabilities can be **introduced, exploited, fixed, and regression-tested** in a controlled environment.

---

## Overview

This application is built with Express.js and PostgreSQL and focuses on **backend security fundamentals**, not UI.

It is intended to be used as:
- A personal AppSec / pentesting lab
- A regression-testing playground for access control issues
- A backend-only target for API security testing

---

## Key Security Concepts Demonstrated

- Session-based authentication
- Role-Based Access Control (RBAC)
- Ownership-based authorization (IDOR prevention)
- Rate limiting & account lockout
- Secure password storage (bcrypt)
- Input validation (Zod)
- Security headers (Helmet)
- Deterministic test environment with Docker
- Authorization regression testing (CI-friendly)

---

## Features

### Authentication
- Session-based login/logout
- Password hashing with bcrypt
- Account lockout after repeated failures
- `/me` endpoint for session validation

### Authorization
- RBAC (`admin`, `user`)
- Admin-only endpoints
- Ownership checks on business entities (orders)

### Business Logic
- Order management system
- Orders belong to a specific user
- Admin can access all orders
- Regular users can access **only their own** orders

### Security Tooling
- Rate limiting on authentication endpoints
- HTTP security headers via Helmet
- Correlation ID support for request tracing
- Authorization test suite to prevent regressions

---

## Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Session Store:** PostgreSQL (`connect-pg-simple`)
- **Security:**
  - Helmet
  - bcrypt
  - Rate limiting
- **Validation:** Zod
- **Logging:** Console-based (correlation ID support)
- **Containerization:** Docker & Docker Compose

---

## Project Structure

├── src/
│   ├── admin.js            # Admin-only endpoints
│   ├── auth.js             # Authentication logic
│   ├── db.js               # Database connection pool
│   ├── orders.js           # Order endpoints + ownership checks
│   ├── rbac.js             # Role-based access control helpers
│   ├── routes.js           # Public routes
│   └── server.js           # Express app setup
│
├── scripts/
│   ├── migrate.sql         # Base schema
│   ├── migrate-auth.sql    # Auth tables
│   ├── migrate-orders.sql  # Orders schema
│   ├── seed.js             # Seed users and data
│   ├── authz-test.sh       # Authorization test suite
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .env.ci
├── package.json
└── README.md

---

## Getting Started

### Prerequisites

- Node.js 20+ **or** Docker
- PostgreSQL (local) **or** Docker
- npm

---

## Environment Configuration

Create a local `.env` file from the example:

cp .env.example .env

Example variables:

DB_HOST=localhost
DB_PORT=5432
DB_NAME=appsec_lab
DB_USER=postgres
DB_PASSWORD=your_password

APP_NAME=app-a
PORT=3001
NODE_ENV=development

.env.ci is used only for CI environments and contains non-sensitive defaults.

⸻

Running the Application

Local (Node.js)

npm install
npm run migrate:base
npm run migrate:auth
npm run migrate:orders
npm run seed
npm run dev

With Docker

docker-compose up --build


⸻

API Endpoints

Health

GET /health

Authentication

POST /auth/login
POST /auth/logout
GET  /me

Orders

POST /orders
GET  /orders
GET  /orders/:id

Admin (RBAC protected)

GET   /admin/users
PATCH /admin/users/:id/role


⸻

Authorization Testing

This project includes an authorization regression test suite that verifies:
	•	Guest vs user vs admin access
	•	RBAC enforcement
	•	Ownership-based access control (IDOR prevention)

Run it with:

npm run authz

The test suite is designed to fail if:
	•	An endpoint becomes unintentionally accessible
	•	Ownership checks are broken
	•	RBAC rules regress

⸻

Intended Usage

This project is not a production app.

It is intentionally designed to:
	•	Learn AppSec concepts
	•	Practice pentesting techniques
	•	Safely introduce and fix vulnerabilities
	•	Validate security fixes with automated tests

⸻

License

ISC

⸻

Author

Maintained for personal learning and security research.

⸻

Bugs / Issues

If you find inconsistencies or issues, feel free to open an issue:

https://github.com/AegisX438/appsec-lab-app-a/issues
