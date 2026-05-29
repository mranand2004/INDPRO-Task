# Task Manager App — Implementation Plan

## Project Overview

A full-stack Task Manager application where users can manage tasks across three stages: **Todo**, **In Progress**, and **Done**. Includes authentication, CRUD operations, responsive UI, and deployment.

**Tech Stack:** MERN (MongoDB, Express, React + Vite, Node.js)

---

## Phase 1: Backend — Authentication System

### Scope
Set up user authentication with JWT-based login and registration.

### Tasks
1. Create `User` model (name, email, password)
2. Install & configure `bcryptjs` for password hashing
3. Install & configure `jsonwebtoken` for JWT tokens
4. Create auth routes:
   - `POST /api/auth/register` — Register new user
   - `POST /api/auth/login` — Login & return JWT
   - `GET /api/auth/me` — Get current user (protected)
5. Create `authMiddleware` to protect routes (verify JWT from `Authorization` header)
6. Input validation & error handling middleware

### Deliverables
- `server/src/models/User.js`
- `server/src/routes/auth.js`
- `server/src/controllers/authController.js`
- `server/src/middleware/authMiddleware.js`
- `server/src/middleware/errorHandler.js`

---

## Phase 2: Backend — Task CRUD API

### Scope
Build RESTful API for task management, scoped to authenticated users.

### Tasks
1. Create `Task` model (title, description, stage, user reference, timestamps)
   - Stages: `todo`, `in-progress`, `done`
2. Create task routes (all protected):
   - `GET /api/tasks` — Get all tasks for logged-in user
   - `POST /api/tasks` — Create a new task
   - `PUT /api/tasks/:id` — Update task (title, description, stage)
   - `DELETE /api/tasks/:id` — Delete a task
3. Ensure users can only access their own tasks
4. Add validation (title required, stage must be valid enum)

### Deliverables
- `server/src/models/Task.js`
- `server/src/routes/tasks.js`
- `server/src/controllers/taskController.js`
- Updated `server/src/index.js` with new routes

---

## Phase 3: Frontend — Auth UI & State Management

### Scope
Build login/register pages and set up global auth state.

### Tasks
1. Install `react-router-dom` and `axios`
2. Set up React Router with route structure
3. Create auth context/provider for global auth state
4. Build pages:
   - `LoginPage` — Email & password form
   - `RegisterPage` — Name, email, password form
5. Create `ProtectedRoute` component (redirect to login if not authenticated)
6. Store JWT in localStorage, attach to API requests via axios interceptor
7. Handle loading & error states on forms

### Deliverables
- `client/src/context/AuthContext.jsx`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/RegisterPage.jsx`
- `client/src/components/ProtectedRoute.jsx`
- `client/src/utils/api.js` (axios instance with interceptor)
- `client/src/App.jsx` (updated with routes)

---

## Phase 4: Frontend — Task Board UI

### Scope
Build the main task management interface with Kanban-style columns.

### Tasks
1. Create task context/provider for task state management
2. Build main `Dashboard` page with three columns: Todo, In Progress, Done
3. Create reusable components:
   - `TaskColumn` — Displays tasks for a specific stage
   - `TaskCard` — Individual task with edit/delete actions
   - `TaskForm` — Modal/form for creating & editing tasks
4. Implement task CRUD operations connected to API
5. Allow changing task stage (move between columns)
6. Handle loading states (skeleton/spinner) and error toasts
7. Empty state for columns with no tasks

### Deliverables
- `client/src/context/TaskContext.jsx`
- `client/src/pages/Dashboard.jsx`
- `client/src/components/TaskColumn.jsx`
- `client/src/components/TaskCard.jsx`
- `client/src/components/TaskForm.jsx`
- `client/src/components/Loader.jsx`

---

## Phase 5: Styling & Responsiveness

### Scope
Make the UI production-ready, stunning, and fully responsive.

### Tasks
1. Install and configure CSS approach (CSS Modules or Tailwind CSS)
2. Design consistent color scheme, typography, spacing
3. Style auth pages (centered card layout, form validation feedback)
4. Style dashboard:
   - Kanban board layout (horizontal on desktop, vertical stack on mobile)
   - Card hover effects, transitions
   - Modal styling for task form
5. Add responsive breakpoints (mobile, tablet, desktop)
6. Add a navbar with user info and logout
7. Loading skeletons and error state styling
8. Dark/light theme consideration (optional bonus)

### Deliverables
- All component styles (CSS modules or Tailwind classes)
- `client/src/components/Navbar.jsx`
- Responsive layout across all breakpoints

---

## Phase 6: Polish, Testing & Deployment

### Scope
Final polish, README documentation, and deployment to free hosting.

### Tasks
1. Add input validation on both frontend and backend
2. Handle edge cases (expired token, network errors, empty states)
3. Add proper error boundaries
4. Write comprehensive `README.md`:
   - Project description & screenshots
   - Tech stack & architecture decisions
   - Setup instructions (local dev)
   - Assumptions & tradeoffs
   - Live deployment links
5. Deploy frontend to **Vercel** or **Netlify** (free tier)
6. Deploy backend to **Render** or **Railway** (free tier)
7. Set up MongoDB Atlas (free cluster) for production database
8. Configure environment variables on hosting platforms
9. Final testing on deployed URLs

### Deliverables
- `README.md` (comprehensive)
- Live frontend URL
- Live backend URL
- MongoDB Atlas production database

---

## Architecture Summary

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth & Task context providers
│   ├── pages/            # Page-level components
│   ├── utils/            # API instance, helpers
│   ├── App.jsx           # Router setup
│   └── main.jsx          # Entry point

server/
├── src/
│   ├── config/           # DB connection
│   ├── controllers/      # Route handlers (business logic)
│   ├── middleware/       # Auth, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   └── index.js          # Server entry point
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend framework | React + Vite | Fast dev experience, modern tooling |
| State management | React Context | Sufficient for this scale, no extra deps |
| Auth strategy | JWT in localStorage | Simple, stateless, works with REST API |
| API proxy | Vite proxy in dev | Avoids CORS issues during development |
| Database | MongoDB Atlas | Free tier, pairs naturally with Mongoose |
| Frontend hosting | Vercel | Free, zero-config for Vite/React apps |
| Backend hosting | Render | Free tier with auto-deploy from GitHub |

---

## Implementation Status

✅ **Phase 1: Backend Authentication** — Completed  
✅ **Phase 2: Backend Task CRUD API** — Completed  
✅ **Phase 3: Frontend Auth UI** — Completed  
✅ **Phase 4: Frontend Task Board** — Completed  
✅ **Phase 5: Styling & Responsiveness** — Completed  
✅ **Phase 6: Deployment & Documentation** — Completed  

**Total Development Time:** ~3-4 hours  
**All features implemented and tested successfully.**
