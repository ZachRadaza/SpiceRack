# SpiceRack — Recipe Book Backend & Frontend

SpiceRack is a full-stack learning project that started as a simple TypeScript + Express backend and gradually evolved into a complete recipe book app with a built-in frontend. It’s structured for clarity, modularity, and learning.

---

## Current Features

 - TypeScript + Express backend
 - Prisma ORM with PostgreSQL
 - User authentication (register, login, session handling)
 - Recipe CRUD (create, read, update, delete)
 - In-memory pagination + DB filtering
 - Frontend (vanilla TypeScript + HTML + CSS) served from /public
 - Modular Architecure

---

## Tech Stack

| Layer             | Technology                       |
| ----------------- | -------------------------------- |
| Language          | TypeScript                       |
| Backend Framework | Express.js                       |
| ORM               | Prisma                           |
| Database          | PostgreSQL                       |
| Frontend          | Vanilla TypeScript + HTML + CSS  |
| Auth              | Cookie or JWT (configurable)     |
| Dev Tools         | ts-node, nodemon, bcrypt, dotenv |
| Optional          | Prisma Studio for DB UI          |

---

## Project Structure

```plaintext
spicerack/
├── prisma/
│   ├── schema.prisma              # Database models (User, Recipe, etc.)
│   └── migrations/                # Auto-generated Prisma migrations
├── public/                        # Frontend (static files served by Express)
│   ├── index.html
│   ├── main.ts
│   ├── components/                # Reusable UI pieces
│   ├── pages/                     # Page-specific HTML/CSS/TS
│   ├── assets/                    # Images and icons
│   └── styles.css
├── src/
│   ├── api/
│   │   ├── auth/                  # Auth routes (register, login, etc.)
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.router.ts
│   │   │   └── auth.service.ts
│   │   ├── recipes/               # Recipe routes
│   │   │   ├── recipe.controller.ts
│   │   │   ├── recipe.router.ts
│   │   │   ├── recipe.service.ts
│   │   │   └── recipe.ts
│   │   └── router.ts              # Combines all routers
│   ├── db/
│   │   └── prisma.ts              # Prisma client instance
│   ├── lib/
│   │   ├── password.ts            # Hash + verify utilities
│   │   └── session.ts             # Session/JWT helper logic
│   ├── index.ts                   # Express app entry point
│   └── middleware/ (optional)     # Error handling, logging, etc.
├── scripts/
│   └── password-test.ts           # Quick hashing test script
├── tsconfig.base.json
├── tsconfig.client.json
├── tsconfig.server.json
├── package.json
└── README.md
```

---

## Setup and Run

### Install Dependencies

```bash
npm install
```

### Environment Variables
Create .env file at the project root

```ini
DATABASE_URL="postgresql://user:password@localhost:5432/spicerackdb?schema=public"
PORT=3000
```

### Run Migrations & Generate Prisma Client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Run Application

```bash
npm run create
```
Visit: http://localhost:3000

---

## API Overview

### Public Routes
| Method | Endpoint           | Description                                               |
| ------ | ------------------ | --------------------------------------------------------- |
| GET    | `/api/health`      | Health check                                              |
| GET    | `/api/recipes`     | List all recipes (supports `?q=`, `?page=`, `?pageSize=`) |
| GET    | `/api/recipes/:id` | Get a recipe by ID                                        |

### Auth Routes
| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Create a new user        |
| POST   | `/api/auth/login`    | Log in a user            |
| GET    | `/api/auth/me`       | Get the current user     |
| POST   | `/api/auth/logout`   | Log out the current user |

### Protected Routes
| Method | Endpoint           | Description                     |
| ------ | ------------------ | ------------------------------- |
| POST   | `/api/recipes`     | Create a recipe (auth required) |
| PATCH  | `/api/recipes/:id` | Update a recipe (author only)   |
| DELETE | `/api/recipes/:id` | Delete a recipe (author only)   |
