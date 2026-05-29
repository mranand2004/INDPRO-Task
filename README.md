# TaskFlow — Task Manager App

A full-stack Task Manager application built with the MERN stack. Users can manage tasks across three stages: **To Do**, **In Progress**, and **Done**.

## Live Demo

| Layer | URL |
|-------|-----|
| Frontend | _[Add your Vercel URL here]_ |
| Backend | _[Add your Render URL here]_ |

---

## Features

- **Authentication** — Register & Login with JWT (access + refresh token rotation)
- **Task CRUD** — Create, read, update, and delete tasks
- **Kanban Board** — Visual board with three stage columns
- **Stage Management** — Move tasks between stages via dropdown
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Loading & Error States** — Skeleton loaders, toast notifications, retry on failure
- **Security** — httpOnly cookies, token rotation, reuse detection, input validation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7, Axios |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB (Atlas) |
| Auth | JWT (access + refresh tokens with rotation) |
| Styling | Custom CSS (no framework — lightweight & fast) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

```
├── client/                     React frontend (Vite)
│   ├── src/
│   │   ├── components/         Reusable UI components
│   │   ├── context/            Auth & Task state (React Context)
│   │   ├── pages/              Page-level components
│   │   ├── utils/              Axios instance with interceptors
│   │   └── App.jsx             Router setup
│   ├── vercel.json             SPA rewrite rules
│   └── vite.config.js          Dev proxy + build config
│
├── server/                     Express backend
│   ├── src/
│   │   ├── config/             DB connection, constants
│   │   ├── controllers/        Business logic
│   │   ├── middleware/         Auth guard, error handler, validation
│   │   ├── models/             Mongoose schemas (User, Task)
│   │   ├── routes/             Route definitions
│   │   ├── utils/              Token utils, ApiError class, cookie config
│   │   └── validators/         express-validator rules
│   └── .env.example            Environment variable template
│
└── README.md
```

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Public | Refresh access token (uses cookie) |
| POST | `/api/auth/logout` | Private | Logout current session |
| POST | `/api/auth/logout-all` | Private | Logout all devices |
| GET | `/api/auth/me` | Private | Get current user |

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Private | Get all tasks (supports `?stage=` and `?sort=`) |
| POST | `/api/tasks` | Private | Create task |
| GET | `/api/tasks/:id` | Private | Get single task |
| PUT | `/api/tasks/:id` | Private | Update task |
| DELETE | `/api/tasks/:id` | Private | Delete task |
| PATCH | `/api/tasks/:id/stage` | Private | Change task stage |

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas free cluster)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Install dependencies

```bash
npm run install-all
```

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secrets
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Run the app

```bash
npm run dev
```

This starts both frontend (http://localhost:3000) and backend (http://localhost:5000) concurrently.

---

## Deployment Guide

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL
   - `JWT_ACCESS_SECRET` = strong random string
   - `JWT_REFRESH_SECRET` = different strong random string

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://your-app.onrender.com`)

### Database (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist `0.0.0.0/0` for Render access
4. Copy the connection string to your Render env vars

---

## Technical Decisions & Tradeoffs

| Decision | Rationale |
|----------|-----------|
| **JWT with refresh token rotation** | Balances security (short-lived access) with UX (no frequent re-login). Rotation + reuse detection mitigates token theft. |
| **Refresh token in httpOnly cookie** | Cannot be accessed by JavaScript — protects against XSS. |
| **React Context over Redux** | App scope is small enough that Context + useReducer pattern is sufficient without extra bundle size. |
| **Custom CSS over Tailwind** | Keeps bundle minimal, demonstrates CSS architecture skills, no build-time dependency. |
| **Vite over CRA** | Faster dev server (ESM-based), smaller production bundles, modern tooling. |
| **express-validator** | Declarative validation at route level, cleaner than manual checks in controllers. |
| **Compound MongoDB index** | `{ user: 1, createdAt: -1 }` optimizes the primary query pattern (user's tasks, newest first). |
| **No drag-and-drop** | Kept scope focused on core requirements. Stage change via dropdown is functional and accessible. |

---

## Assumptions

- Users only need to manage their own tasks (no sharing/collaboration)
- Three fixed stages are sufficient (no custom stages)
- No file uploads or rich text in task descriptions
- Email is the unique identifier for accounts
- Single-page application with client-side routing

---

## What I'd Add With More Time

- Drag-and-drop between columns (react-beautiful-dnd or dnd-kit)
- Task priority levels and due dates
- Search and filter tasks
- Dark mode toggle
- Rate limiting on auth endpoints
- Email verification on registration
- Password reset flow
- Unit and integration tests (Jest + React Testing Library)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client & server in development |
| `npm run server` | Start only the backend |
| `npm run client` | Start only the frontend |
| `npm run install-all` | Install all dependencies (root + server + client) |

---

## License

MIT
