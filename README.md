# appsec-lab-app-a

A security-focused Node.js application demonstrating authentication, authorization, and secure API practices with PostgreSQL backend.

## Overview

This is a sample application built with Express.js that includes:
- **Authentication**: Session-based user authentication with password hashing (bcrypt)
- **Authorization**: Role-based access control (RBAC) for managing user permissions
- **Security Headers**: Helmet.js for HTTP security headers
- **Rate Limiting**: Express rate limiting to prevent abuse
- **Database**: PostgreSQL with connection pooling
- **Logging**: Structured logging with Pino
- **Input Validation**: Zod for schema validation

## Features

- User authentication and session management
- Role-based access control (Admin, User roles)
- Order management system
- Database migrations
- Docker support for containerized deployment
- Comprehensive security middleware

## Technology Stack

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: PostgreSQL
- **Session Store**: PostgreSQL (connect-pg-simple)
- **Security**:
  - Helmet for HTTP headers
  - bcrypt for password hashing
  - Rate limiting
- **Logging**: Pino with HTTP middleware
- **Validation**: Zod
- **Development**: Nodemon

## Project Structure

```
├── src/
│   ├── admin.js          # Admin-related endpoints
│   ├── auth.js           # Authentication logic
│   ├── db.js             # Database connection and pool
│   ├── logger.js         # Logging configuration
│   ├── orders.js         # Order management endpoints
│   ├── rbac.js           # Role-based access control
│   ├── routes.js         # Public routes
│   └── server.js         # Express application setup
├── scripts/
│   ├── migrate.sql       # Base database schema migration
│   ├── migrate-auth.sql  # Authentication schema migration
│   ├── migrate-orders.sql # Orders schema migration
│   ├── authz-test.sh     # Authorization testing script
│   ├── seed.js           # Database seeding script
│   └── run-sql.js        # SQL execution utility
├── docker-compose.yml    # Docker compose configuration
├── Dockerfile            # Container image definition
├── package.json          # Node dependencies
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 20+ or Docker
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AegisX438/appsec-lab-app-a.git
cd appsec-lab-app-a
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appsec_lab
DB_USER=postgres
DB_PASSWORD=your_password
APP_NAME=app-a
PORT=3001
NODE_ENV=development
```

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**With Docker:**
```bash
docker-compose up
```

### Database Setup

Run migrations to set up the database schema:
```bash
npm run migrate:base
npm run migrate:auth
```

Seed the database with sample data:
```bash
npm run seed
```

### Testing Authorization

Run the authorization test script:
```bash
npm run authz
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint with database status

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user info

### Orders
- `GET /orders` - List user's orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details

### Admin
- `GET /admin/users` - List all users (admin only)
- `GET /admin/orders` - List all orders (admin only)

## Security Features

- **HTTPS Headers**: Helmet middleware for security headers
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Configured rate limits on authentication endpoints
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Zod schema validation
- **Session Security**: Secure session storage in PostgreSQL
- **Correlation IDs**: Request tracing across logs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | appsec_lab |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `APP_NAME` | Application identifier | app-a |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Author

[Your Name/Organization]

## Bugs

Report bugs at: https://github.com/AegisX438/appsec-lab-app-a/issues
