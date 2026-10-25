# 🏠 HostelCare — Hostel Complaint Tracker

> A full-stack web application for managing hostel complaints with role-based access, automatic prioritization, analytics, student feedback, and complaint reopening.

---

## 📋 Table of Contents

1. [Introduction](#-introduction)
2. [Problem Statement](#-problem-statement)
3. [Objectives](#-objectives)
4. [Features](#-features)
5. [Tech Stack](#-tech-stack)
6. [System Architecture](#-system-architecture)
7. [Folder Structure](#-folder-structure)
8. [Database Schema](#-database-schema)
9. [API Endpoints](#-api-endpoints)
10. [Authentication & Security](#-authentication--security)
11. [Module Descriptions](#-module-descriptions)
12. [Screenshots](#-screenshots)
13. [Requirements](#-requirements)
14. [Installation & Setup](#-installation--setup)
15. [Running the Application](#-running-the-application)
16. [Testing](#-testing)
17. [Project Status](#-project-status)
18. [Future Enhancements](#-future-enhancements)
19. [Conclusion](#-conclusion)
20. [References](#-references)

---

## 📖 Introduction

**HostelCare** is a complete hostel complaint management platform built as a
production-quality full-stack web application. It enables **students** to report
hostel issues and **managers** to triage, assign, track, and resolve them — all
through intuitive, role-based dashboards with real-time analytics.

The project demonstrates end-to-end software engineering principles including
REST API design, JWT-based authentication, role-based access control (RBAC),
responsive UI design, and database modeling with MongoDB.

**Developed using:**
- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express 4 REST API
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JWT + bcrypt with role-based middleware

---

## 🎯 Problem Statement

Hostels in educational institutions face challenges in managing student
complaints efficiently. Traditional methods — paper registers, verbal
complaints, or email-based tracking — suffer from:

- **No centralized tracking** — complaints get lost or forgotten
- **Lack of transparency** — students cannot see the status of their complaints
- **No prioritization** — critical issues (e.g., electrical faults, water leaks)
  are treated the same as minor ones
- **No accountability** — it's unclear who is responsible for resolution
- **No analytics** — management cannot identify recurring issues or measure
  response times

HostelCare addresses all these problems with a digital, role-based complaint
management system.

---

## 🎯 Objectives

1. **Digitize** the complaint registration and tracking process
2. **Automate prioritization** based on the type of issue reported
3. Provide **role-based dashboards** — students see their complaints; managers
   see all complaints with management tools
4. Enable **real-time status tracking** from submission to resolution
5. Offer **analytics and reporting** for data-driven decision making
6. Ensure **security** with JWT authentication and bcrypt password hashing
7. Build a **responsive UI** that works on desktop, tablet, and mobile

---

## ✨ Features

### Student Features
| Feature | Description |
|---------|-------------|
| Self-Registration | Students register with email, hostel, and room number. Role is always forced to `student` |
| Complaint Submission | Report issues from predefined **category → issue** pairs (no free-text categories) |
| Auto-Priority | Priority (low / medium / high / critical) is derived **server-side** from the selected issue — clients cannot set it |
| Photo Attachment | Optional image upload with complaints |
| Complaint History | View all own complaints with status, timeline, and manager comments |
| Search & Filter | Search, filter by status/priority/category, and sort own complaints |
| Status Tracking | Visibility into complaint lifecycle |
| Resolution Feedback | Rate an owned resolved complaint from **1–5 stars** and optionally leave a comment (up to 500 characters) |
| Reopen Resolved Complaint | Reopen an owned resolved complaint with a required reason (1–500 characters); status returns to `pending` |

### Manager Features
| Feature | Description |
|---------|-------------|
| KPI Dashboard | Total / pending / in-progress / resolved / critical complaint counts at a glance |
| Complaint Management | Search, filter by category, issue, status, priority, hostel, and date |
| Status Updates | Change status (`pending → in_progress → resolved` or `rejected`) |
| Priority Override | Override the auto-assigned priority when needed |
| Manager Comments | Add notes/updates visible to the student |
| Assignment | Assign complaints to specific staff members |
| Student Directory | View all registered students with per-student complaint statistics |
| Analytics | Category breakdowns, status distribution, priority charts, top issues, resolution stats |
| Student Feedback Visibility | View students’ ratings and optional comments on resolved complaints |
| Reopening Visibility | View the reason and timestamp when a student reopens a complaint |

### Platform Features
| Feature | Description |
|---------|-------------|
| Landing Page | Modern SaaS-style responsive landing with feature showcase |
| Responsive UI | Sidebar on desktop, drawer on mobile; tables collapse to cards on small screens |
| Human-Readable IDs | Complaints use sequential IDs: `CMP-0001`, `CMP-0002`, … |
| Toast Notifications | User feedback for all actions (success, error, info) |
| State Management | Loading, empty, and error states handled everywhere |
| Route Protection | Client-side route guards + server-side role enforcement |
| Mock Mode | Built-in mock API with demo data — frontend works without backend |

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | Component-based UI library |
| | Vite 6 | Fast build tool and dev server |
| | Tailwind CSS v4 | Utility-first CSS framework |
| | React Router 7 | Client-side routing and navigation |
| | Axios | HTTP client for API communication |
| | Lucide React | Modern SVG icon library |
| **Backend** | Node.js (v24) | JavaScript runtime environment |
| | Express 4 | Web application framework for REST API |
| **Database** | MongoDB | NoSQL document database |
| | Mongoose 8 | ODM for MongoDB (schema, validation, queries) |
| **Auth** | JSON Web Tokens (JWT) | Stateless authentication tokens |
| | bcryptjs | Password hashing (pure-JS, Windows-safe) |
| **Dev Tools** | Nodemon | Auto-restart backend on file changes |
| | dotenv | Environment variable management |
| | CORS | Cross-origin resource sharing middleware |
| | express-rate-limit | API rate limiting for auth routes |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           React 19 + Vite + Tailwind CSS v4              │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐  │   │
│  │  │  Pages   │  │Components│  │   Context (Auth/Toast) │  │   │
│  │  └────┬─────┘  └────┬─────┘  └────────────┬───────────┘  │   │
│  │       └──────────────┴──────────────────────┘             │   │
│  │                      │                                    │   │
│  │              ┌───────▼───────┐                            │   │
│  │              │ Service Layer │ ← Axios / Mock API switch  │   │
│  │              └───────┬───────┘                            │   │
│  └──────────────────────┼────────────────────────────────────┘   │
│                         │  HTTP (REST)                           │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                    │
│                                                                 │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  Routes  │→ │ Middleware  │→ │ Controllers │→ │  Models   │  │
│  │          │  │ (JWT Auth,  │  │ (Business   │  │(Mongoose) │  │
│  │ /api/auth│  │  Role RBAC) │  │  Logic)     │  │           │  │
│  │ /api/    │  │             │  │             │  │ User      │  │
│  │complaints│  └────────────┘  └─────────────┘  │ Complaint │  │
│  │ /api/    │                                    └─────┬─────┘  │
│  │students  │                                          │        │
│  │ /api/    │                                          ▼        │
│  │analytics │                                   ┌───────────┐   │
│  └──────────┘                                   │  MongoDB   │   │
│                                                 │ (Database) │   │
│                                                 └───────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow
1. User interacts with the React UI
2. Service layer sends HTTP request (with JWT in Authorization header)
3. Express router matches the endpoint
4. Auth middleware verifies the JWT and loads the user
5. Role middleware (`authorizeManager`) checks authorization
6. Controller executes business logic using Mongoose models
7. Response is sent back to the client in a standard envelope format

---

## 📁 Folder Structure

```
hostel-complaint-tracker/
├── frontend/                        # React + Vite + Tailwind CSS
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Charts/              # SVG/CSS charts (no external chart library)
│   │   │   ├── Complaints/          # Table, filter bar, form, details view
│   │   │   ├── Layout/              # Navbar, footer, dashboard shell
│   │   │   └── ui/                  # Button, Input, Select, Badges, Modal, …
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── student/             # Dashboard, Create, My Complaints, Details
│   │   │   └── manager/             # Dashboard, All Complaints, Details,
│   │   │                            #   Students, Analytics
│   │   ├── layouts/                 # AuthLayout, StudentLayout, ManagerLayout
│   │   ├── context/                 # AuthContext, ToastContext
│   │   ├── services/                # api.js (axios/mock switch), mockApi.js
│   │   ├── hooks/                   # useAuth, useToast, useFetch, useDebounce
│   │   ├── utils/                   # constants (categories/priorities), format,
│   │   │                            #   validators
│   │   ├── data/                    # mockData.js (demo seed data)
│   │   ├── App.jsx                  # Routes + guards
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .env                         # Frontend environment variables
│   ├── .env.example                 # Template for .env
│   ├── vite.config.js               # Vite configuration
│   └── package.json
│
├── backend/                         # Express + MongoDB REST API
│   ├── config/
│   │   └── db.js                    # MongoDB connection (Mongoose)
│   ├── constants/
│   │   └── complaints.js            # Category → issue → priority whitelists
│   ├── controllers/
│   │   ├── authController.js        # Register, login, getMe, updateProfile
│   │   └── complaintController.js   # CRUD for complaints
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification + role-based guards
│   │   ├── errorHandler.js          # ApiError, 404 handler, centralized errors
│   │   ├── rateLimit.js             # express-rate-limit for auth routes
│   │   └── validate.js              # Request validation middleware
│   ├── models/
│   │   ├── User.js                  # User schema (bcrypt pre-save hook)
│   │   └── Complaint.js             # Complaint schema
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── complaintRoutes.js       # /api/complaints/*
│   │   ├── studentRoutes.js         # /api/students/*
│   │   └── analyticsRoutes.js       # /api/analytics/*
│   ├── utils/
│   │   ├── complaintId.js           # Duplicate-safe CMP-#### generation
│   │   ├── pagination.js            # Optional page/limit parsing
│   │   ├── complaintActions.js      # Feedback/reopen validation and eligibility
│   │   ├── seedManager.js           # Create/repair initial manager account
│   │   └── validation.js            # Pure input-validation helpers
│   ├── tests/                       # node --test suites (unit + API integration)
│   ├── server.js                    # Express app entry point
│   ├── .env                         # Backend environment variables
│   ├── .env.example                 # Template for .env
│   └── package.json
│
├── ui-smoke.mjs                     # Headless-browser UI smoke run (see Testing)
├── README.md                        # This file
└── .gitignore
```

---

## 🗃️ Database Schema

### User Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | auto-generated | Primary key |
| `name` | String | required | Full name |
| `email` | String | required, unique, lowercase | Login email |
| `password` | String | required, select: false | bcrypt hash (never returned in API responses) |
| `role` | String | enum: `student`, `manager` | User role (default: `student`) |
| `hostel` | String | optional | Hostel name (e.g., "A Block") |
| `room` | String | optional | Room number |
| `createdAt` | Date | auto (timestamps) | Account creation time |
| `updatedAt` | Date | auto (timestamps) | Last update time |

### Complaint Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | auto-generated | Primary key |
| `complaintId` | String | required, unique | Human-readable ID (`CMP-0001`, `CMP-0002`, …) |
| `studentId` | ObjectId | required, ref → User | The student who filed the complaint |
| `category` | String | required | Complaint category (Electrical, Plumbing, etc.) |
| `issue` | String | required | Specific issue within the category |
| `description` | String | required | Detailed description from the student |
| `hostel` | String | required | Hostel where the issue exists |
| `room` | String | required | Room number |
| `priority` | String | enum: `low`, `medium`, `high`, `critical` | Auto-derived from issue; manager can override |
| `status` | String | enum: `pending`, `in_progress`, `resolved`, `rejected` | Complaint lifecycle status |
| `managerComment` | String | optional | Manager's update/note for the student |
| `assignedTo` | String | optional | Name of assigned staff member |
| `resolvedAt` | Date | optional | Timestamp when complaint was resolved |
| `feedbackRating` | Number | nullable, 1–5 | Student rating after resolution |
| `feedbackComment` | String | optional, max 500 characters | Student's optional feedback comment |
| `reopenedAt` | Date | nullable | Timestamp of student reopening |
| `reopenReason` | String | max 500 characters | Reason supplied when reopening |
| `createdAt` | Date | auto (timestamps) | Complaint filing time |
| `updatedAt` | Date | auto (timestamps) | Last modification time |

### Entity-Relationship Diagram

```
┌──────────────┐          ┌──────────────────┐
│     User     │          │    Complaint      │
├──────────────┤          ├──────────────────┤
│ _id (PK)     │◄────────┤ studentId (FK)    │
│ name         │    1:N   │ complaintId       │
│ email        │          │ category          │
│ password     │          │ issue             │
│ role         │          │ description       │
│ hostel       │          │ hostel            │
│ room         │          │ room              │
│ createdAt    │          │ priority          │
│ updatedAt    │          │ status            │
└──────────────┘          │ managerComment    │
                          │ assignedTo        │
                          │ resolvedAt        │
                          │ createdAt         │
                          │ updatedAt         │
                          └──────────────────┘
```

**Relationship:** One User (student) → Many Complaints (1:N)

### Category → Issue → Priority Mapping

The system uses a centralized mapping defined in `frontend/src/utils/constants.js`.
When a student selects a category and issue, the priority is automatically derived:

| Category | Example Issues | Auto-Priority |
|----------|---------------|--------------|
| Electrical | Power outage, Short circuit | Critical |
| Electrical | Fan not working, Light flickering | Medium |
| Plumbing | Water leakage, Pipe burst | High |
| Plumbing | Low water pressure | Medium |
| Furniture | Broken bed/chair, Missing furniture | Medium |
| Cleaning | Dirty washroom, Pest infestation | High |
| Internet | No connectivity, Slow speed | Medium |
| Security | Lock broken, Unauthorized entry | Critical |
| Other | General maintenance | Low |

---

## ⭐ Resolution Feedback and Student Reopening

These two features are available on the **student complaint details** page after a complaint has been marked `resolved`. They work in both the real MongoDB API and the frontend mock mode.

### Feedback and rating

1. A manager marks a complaint `resolved`.
2. The student who created it opens its details page, selects an **integer rating from 1 to 5**, and optionally enters a comment (maximum **500 characters**).
3. The frontend calls `POST /api/complaints/:id/feedback`; the backend checks authentication, ownership, resolved status, and input validity before saving `feedbackRating` and `feedbackComment`.
4. The manager can read the saved rating and comment in the complaint details.

### Reopening a resolved complaint

1. The student opens their own resolved complaint and supplies a **required reason of 1–500 characters**.
2. The frontend calls `POST /api/complaints/:id/reopen`; the backend checks authentication, ownership, status, and the reason.
3. The complaint returns to `pending`, `resolvedAt` is cleared, and `reopenedAt` and `reopenReason` are stored.
4. Previous resolution feedback is cleared for the new resolution cycle. The manager can see the reopening information and continue working on the complaint.

**Authorization:** These endpoints are for the student who owns the complaint, not other students. Both require a valid JWT; only resolved complaints are eligible. Invalid requests receive API errors.

**API requests:**

```http
POST /api/complaints/:id/feedback
Authorization: Bearer <student-jwt>
Content-Type: application/json

{"rating":5,"comment":"Issue fixed promptly"}
```

```http
POST /api/complaints/:id/reopen
Authorization: Bearer <student-jwt>
Content-Type: application/json

{"reason":"The water leak has started again"}
```

**Implementation files:** `backend/models/Complaint.js`, `backend/controllers/complaintController.js`, `backend/routes/complaintRoutes.js`, `backend/utils/complaintActions.js`, `frontend/src/pages/student/StudentComplaintDetails.jsx`, `frontend/src/components/Complaints/ComplaintDetailsView.jsx`, `frontend/src/services/api.js`, and `frontend/src/services/mockApi.js`.

### Verify the new features

Run `cd backend && npm test` for the backend checks, and `cd frontend && npm run build` for the frontend build. The new validation tests are in `backend/tests/complaintActions.test.js`. For an end-to-end manual check, create a complaint as a student, resolve it as a manager, then log back in as that student to submit feedback and reopen it. Verify that the manager sees the rating/comment and the reopening reason. Repeat with `VITE_USE_MOCK=true` and `VITE_USE_MOCK=false`.

---

## 📡 API Endpoints

All API responses follow a consistent envelope format:

```json
// Success
{ "success": true, "message": "…", "data": { } }

// Error
{ "success": false, "message": "Error description" }
```

### Student resolution actions (`/api/complaints`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/complaints/:id/feedback` | Authenticated student owner, resolved complaint | Body: `{ "rating": 1..5, "comment": "optional" }` |
| `POST` | `/api/complaints/:id/reopen` | Authenticated student owner, resolved complaint | Body: `{ "reason": "required" }`; sets status to `pending` |

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new student account (role forced to `student`) |
| `POST` | `/api/auth/login` | Public | Login with email/password → returns JWT + user data |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile from JWT |
| `PUT` | `/api/auth/profile` | Authenticated | Update name, email, hostel, room (role is never editable; duplicate email → 409) |

### Complaints (`/api/complaints`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/complaints` | Student | Create a complaint — category/issue/hostel checked against whitelists; priority derived server-side (a client-sent `priority` is ignored) |
| `GET` | `/api/complaints/my` | Student | The logged-in student's complaints — supports optional `?page=&limit=` |
| `GET` | `/api/complaints/all` | Manager | All complaints (populated `studentId` + `studentName`) — supports optional `?page=&limit=` |
| `GET` | `/api/complaints/:id` | Authenticated | Get a single complaint (students: own only; managers: any) |
| `PUT` | `/api/complaints/:id` | Authenticated | Managers: status/priority/comment/assignment (`resolvedAt` set on resolve, **cleared on reopen**). Students: content of their own **pending** complaint only — priority/status/comments are not student-editable |
| `DELETE` | `/api/complaints/:id` | Authenticated | Delete complaint (students: own pending; managers: any) |

**Pagination:** list endpoints accept optional `?page=` (default `1`) and
`?limit=` (default `20`, max `100`). When provided, the response includes
`data.pagination: { page, limit, total, totalPages }` alongside the items.
Without the params the full result set is returned (the UI filters and sorts
client-side).

### Students (`/api/students`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/students` | Manager | Registered students with per-student complaint stats (optional `?page=&limit=`) |
| `GET` | `/api/students/managers` | Manager | List all manager accounts |

### Analytics (`/api/analytics`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/analytics` | Manager | Dashboard analytics: counts, category breakdown, recent complaints |

---

## 🔐 Authentication & Security

### Authentication Flow

```
┌──────────┐     POST /api/auth/login      ┌──────────┐
│  Client  │ ────────────────────────────→  │  Server  │
│          │  { email, password }           │          │
│          │                                │          │
│          │  ◄──────────────────────────── │          │
│          │  { token: "eyJhb...", user }   │          │
│          │                                │          │
│          │     GET /api/complaints/my     │          │
│          │ ────────────────────────────→  │          │
│          │  Authorization: Bearer eyJhb.. │          │
│          │                                │          │
│          │  ◄──────────────────────────── │          │
│          │  { success: true, data: [...] }│          │
└──────────┘                                └──────────┘
```

### Security Measures

| Measure | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with salt rounds = 10; passwords never stored in plaintext |
| **Password Exclusion** | `select: false` on password field; never returned in any API response |
| **JWT Authentication** | Token signed with `JWT_SECRET`; sent as `Authorization: Bearer <token>` |
| **Role-Based Access Control** | `protect` middleware (JWT verify) + `authorizeManager` middleware |
| **Registration Security** | Controller hard-codes `role: 'student'` — cannot self-register as manager |
| **Input Validation** | Server-side validators on every write endpoint: category→issue and hostel whitelists, room format, length limits; unknown/manager-only fields rejected |
| **Rate Limiting** | `express-rate-limit` on `/api/auth/login` and `/api/auth/register` (50 requests / 15 min / IP, tunable via `AUTH_RATE_LIMIT`) |
| **CORS** | Cross-origin requests configured via middleware |
| **Error Handling** | Centralized error middleware — safe messages for 4xx, generic `Internal server error` for 5xx; details logged server-side only, stack traces never leaked to the client |
| **JWT Lifetime** | Token expiry comes from `JWT_EXPIRES_IN` — nothing hardcoded |
| **Startup Checks** | The server refuses to start if `JWT_SECRET` is missing or weak; there is no fallback secret anywhere in the code |
| **Environment Variables** | Secrets stored in `.env` files (gitignored); `.env.example` as template |

---

## 📦 Module Descriptions

### Frontend Modules

| Module | Files | Description |
|--------|-------|-------------|
| **Pages – Auth** | `Login.jsx`, `Register.jsx` | Login/register forms with validation and demo account quick-fill |
| **Pages – Student** | `StudentDashboard.jsx`, `CreateComplaint.jsx`, `MyComplaints.jsx`, `StudentComplaintDetails.jsx` | Student workflow: dashboard KPIs, file new complaints, view history, track status |
| **Pages – Manager** | `ManagerDashboard.jsx`, `AllComplaints.jsx`, `ManagerComplaintDetails.jsx`, `Students.jsx`, `Analytics.jsx` | Manager workflow: KPI dashboard, triage complaints, manage students, analytics |
| **Pages – Shared** | `Landing.jsx`, `Profile.jsx`, `NotFound.jsx` | Public landing page, user profile editor, 404 handler |
| **Components – Charts** | `Charts/` | Lightweight SVG/CSS chart components (no external charting library) |
| **Components – Complaints** | `Complaints/` | Complaint table, filter bar, complaint form, details view |
| **Components – Layout** | `Layout/` | Navbar, sidebar, footer, dashboard shell |
| **Components – UI** | `ui/` | Reusable primitives: Button, Input, Select, Badge, Modal, etc. |
| **Layouts** | `AuthLayout.jsx`, `StudentLayout.jsx`, `ManagerLayout.jsx` | Route-specific layouts with sidebar navigation |
| **Context** | `AuthContext.jsx`, `ToastContext.jsx` | Global auth state (user, token, login/logout) and toast notifications |
| **Services** | `api.js`, `mockApi.js` | Unified API layer — switches between real HTTP (axios) and mock |
| **Hooks** | `useAuth`, `useToast`, `useFetch`, `useDebounce` | Custom React hooks for common patterns |
| **Utils** | `constants.js`, `format.js`, `validators.js` | Category/issue/priority mappings, date formatters, input validators |

### Backend Modules

| Module | File(s) | Description |
|--------|---------|-------------|
| **Server** | `server.js` | Express app setup, middleware registration, route mounting |
| **Database Config** | `config/db.js` | MongoDB connection via Mongoose |
| **Auth Controller** | `controllers/authController.js` | Register, login (JWT generation), getMe, updateProfile |
| **Complaint Controller** | `controllers/complaintController.js` | CRUD operations for complaints with role-based logic |
| **Auth Middleware** | `middleware/auth.js` | `protect` (JWT verify) + `authorizeManager` (role guard) |
| **Error Handling** | `middleware/errorHandler.js` | `ApiError`, 404 handler, centralized error middleware (5xx never leaked) |
| **Validation** | `middleware/validate.js`, `utils/validation.js` | Pure validators wired into routes (register/login/profile/complaint create) |
| **Rate Limiting** | `middleware/rateLimit.js` | `express-rate-limit` instance mounted on the auth routes |
| **User Model** | `models/User.js` | Mongoose schema with bcrypt pre-save hook and `matchPassword` method |
| **Complaint Model** | `models/Complaint.js` | Mongoose schema with auto-generated `complaintId` |
| **Routes** | `routes/authRoutes.js`, `complaintRoutes.js`, `studentRoutes.js`, `analyticsRoutes.js` | Express router definitions mapping URLs to controllers |
| **Seed Script** | `utils/seedManager.js` | Creates/repairs the initial manager account for development |
| **Shared Constants** | `constants/complaints.js` | Category → issue → priority mapping and input whitelists used by controllers |
| **Tests** | `tests/*.test.js` | Automated unit + API integration tests (`npm test`, Node's built-in test runner) |

---

## 📸 Screenshots

> Run the app locally (`npm run dev` in the `frontend/` folder) and visit
> `http://localhost:5173` to see all pages in action.

### Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing Page | `/` | Public homepage with features showcase and CTA |
| Login | `/login` | Email/password login with demo account quick-fill |
| Register | `/register` | Student registration form |
| Student Dashboard | `/student` | Personal complaint KPIs and recent complaints |
| Create Complaint | `/student/complaints/new` | Category → issue → description form |
| My Complaints | `/student/complaints` | Searchable complaint table with filters |
| Complaint Details (Student) | `/student/complaints/:id` | Full complaint view with status timeline |
| Manager Dashboard | `/manager` | Organization-wide KPIs and overview |
| All Complaints | `/manager/complaints` | All complaints with advanced filtering |
| Complaint Details (Manager) | `/manager/complaints/:id` | Complaint management: status, priority, comments, assignment |
| Students Directory | `/manager/students` | All students with complaint statistics |
| Analytics | `/manager/analytics` | Charts and breakdowns by category, status, priority |
| Profile | `/profile` | Edit name, hostel, and room |

---

## ✅ Requirements

### Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ (developed on v24) | JavaScript runtime |
| npm | 9+ | Package manager |
| MongoDB | 6+ (Community Edition) | Database (only needed for backend mode) |
| Modern Browser | Chrome, Firefox, Edge | Frontend rendering |
| VS Code | Latest | Recommended IDE |

### Hardware Requirements

| Component | Minimum |
|-----------|---------|
| Processor | Intel i3 / AMD equivalent |
| RAM | 4 GB |
| Disk Space | 500 MB (for dependencies) |
| Network | Internet for initial `npm install` |

---

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd hostel-complaint-tracker

# Or extract the downloaded ZIP file and open in VS Code
```

### Step 2: Install Dependencies

Open a terminal in VS Code (`Ctrl + `` ` ``) and run:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 3: Configure Environment Variables

**Frontend** (`frontend/.env`) — already configured:
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=true
```

**Backend** (`backend/.env`) — copy from example and edit:
```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/hostel_complaint_tracker
JWT_SECRET=your_long_random_secret_string_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```

### Environment Variables Reference

#### Backend (`backend/.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://127.0.0.1:27017/hostel_complaint_tracker` | MongoDB connection string |
| `JWT_SECRET` | long random string | Signs JWTs — never commit a real one |
| `JWT_EXPIRES_IN` | `7d` | JWT token lifetime |
| `AUTH_RATE_LIMIT` | `50` | Requests per 15 minutes allowed on auth routes |
| `PORT` | `5000` | Backend API port |
| `NODE_ENV` | `development` | `development` or `production` |

#### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend base URL |
| `VITE_USE_MOCK` | `true` | `true` = mock data (no backend needed), `false` = real API |

> ⚠️ Never commit `.env` files (they are already in `.gitignore`).

---

## ▶️ Running the Application

### Option A: Frontend Only (Mock Mode — No Backend/MongoDB Needed)

This is the **quickest way to run** the project. The frontend uses built-in mock
data and does not need the backend server or MongoDB.

```bash
cd frontend
npm run dev
```

Open your browser at: **http://localhost:5173**

#### Demo Accounts (Mock Mode)

| Role | Email | Password |
|------|-------|----------|
| Student | `student@hostel.com` | `password123` |
| Manager | `manager@hostel.com` | `ChangeThisPassword123!` |

> **Tip:** To reset mock data, clear your browser's localStorage:
> DevTools → Application → Local Storage → Clear.

---

### Option B: Full Stack (Frontend + Backend + MongoDB)

#### 1. Start MongoDB

```bash
# Windows (if installed as a service)
net start MongoDB

# Or run mongod directly
mongod

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
# Should return: { ok: 1 }
```

#### 2. Seed the Manager Account

```bash
cd backend
npm run seed
```

This creates the initial manager account:
- **Email:** `manager@hostel.com`
- **Password:** `ChangeThisPassword123!`

> ⚠️ This is a development-only credential. Change it before any deployment.

#### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

Backend runs at: **http://localhost:5000**

#### 4. Switch Frontend to Real API Mode

Edit `frontend/.env`:
```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:5000/api
```

#### 5. Start the Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

#### 6. Register a Student Account

Visit `http://localhost:5173/register` and create a new student account.

---

### Running Both Servers Simultaneously in VS Code

1. Open **two terminals** in VS Code (click the `+` icon in the terminal panel)
2. **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm run dev
   ```
3. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🧪 Testing

### Automated Backend Tests

The backend ships with an automated suite that runs on Node's built-in test
runner — no extra dependencies:

```bash
cd backend
npm test
```

What it covers:

- **Unit tests** — input validators and whitelists, auto-priority mapping,
  duplicate-safe complaint-ID generation, pagination parsing, centralized
  error handling (5xx messages are never leaked), JWT generation
  (`JWT_EXPIRES_IN` honoured) and the auth middleware.
- **API integration tests** — the full HTTP flow against a dedicated MongoDB
  test database (`hostelcare_api_test`, dropped before/after each run): the
  `{ user }` / `{ complaints }` / `{ analytics }` response envelopes, populated
  `studentId` + `studentName`, server-side auto-priority, students being
  unable to set priority/status, `resolvedAt` clearing on reopen, unique
  complaint IDs after deletions, pagination, role enforcement, profile
  updates, seed-script loginability, analytics and student stats.
  **Skips automatically when MongoDB is not reachable.**
- **HTTP smoke tests** — 404/401/400 response envelopes, generic 5xx handling
  (no raw error text reaches the client) and the auth rate limiter (429).

### Build Verification

```bash
cd frontend
npm run build     # Vite production build (catches import/syntax errors)
```

### Manual Smoke Checklist

The automated tests cover the API contract; the UI itself is best verified by
walking through it in a browser. **Run the checklist in both modes** — mock
(`VITE_USE_MOCK=true`, no backend needed) and real API
(`VITE_USE_MOCK=false` + backend + MongoDB) — after touching the service layer:

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Landing Page | Visit `/` | Landing page loads with features, CTA buttons |
| Student Registration | Visit `/register`, fill form, submit | Account created, redirected to student dashboard |
| Student Login | Visit `/login`, enter credentials | Logged in, redirected to student dashboard |
| Create Complaint | Navigate to "New Complaint", fill form | Complaint created with auto-priority, shows in list |
| View My Complaints | Navigate to "My Complaints" | All own complaints listed with filters |
| Complaint Details | Click a complaint | Full details with status timeline |
| Manager Login | Login as manager | Redirected to manager dashboard |
| Manager Dashboard | View manager home | KPI cards with total/pending/resolved counts |
| Triage Complaint | Open a complaint, change status/priority | Status updated, timestamp recorded |
| Add Comment | Add manager comment | Comment visible to student |
| Analytics | Navigate to Analytics | Charts showing category, status, priority breakdown |
| Responsive Design | Resize browser / use mobile view | UI adapts (sidebar → drawer, table → cards) |
| Profile Update | `/profile`, change name, save | Toast shown, still logged in, header shows new name |
| Student Feedback | Manager resolves a complaint; student rates it 1–5 stars with optional comment | Rating/comment appear for student and manager |
| Student Reopen | Student enters a reason on their resolved complaint | Status returns to pending; manager sees reason; old resolution timestamp clears |
| Reopen Complaint | Manager: resolve a complaint, then reopen | "Resolved on" timestamp disappears from the details view |

> The mock API and the real backend implement the same response shapes; if a
> page works in one mode but not the other, the service-layer contract has
> drifted — check `frontend/src/services/api.js` against the API tables above.

### Automated UI Smoke (headless browser)

Because unit/API tests don't exercise the UI itself, `scripts/ui-smoke.mjs`
drives the **real stack** (mock mode off) in headless Chrome over the DevTools
protocol — no extra npm dependencies. It walks a full student flow (register →
file complaint → details → profile update) and manager flow (login → dashboard
→ search → triage → resolve/reopen → analytics → students), asserting on
success toasts, API traffic and page state:

> **⚠️ Dependency:** The manager flow relies on the **"Manager demo"** quick-fill
> button on the `/login` page (pre-fills `manager@hostel.com` credentials).
> Do **not** remove that button without updating the smoke script accordingly.

```bash
# terminal 1: cd backend && npm run dev
# terminal 2: cd frontend && npm run dev   (VITE_USE_MOCK=false)
# terminal 3: start Chrome with --headless=new --remote-debugging-port=9223
#             (see the header comment in scripts/ui-smoke.mjs), then:
node scripts/ui-smoke.mjs
```

### Build Verification

```bash
cd frontend
npm run build     # Vite production build (catches type/import errors)
```

---

## 📊 Project Status

| Stage | Description | Status |
|-------|-------------|--------|
| 1 | Project structure & setup | ✅ Complete |
| 2 | Frontend UI + mock data | ✅ Complete |
| 3 | Backend Express server | ✅ Complete |
| 4 | MongoDB connection | ✅ Complete |
| 5 | User & Complaint models | ✅ Complete |
| 6 | JWT + bcrypt authentication | ✅ Complete |
| 7 | Role-based authorization | ✅ Complete |
| 8 | Complaint CRUD APIs | ✅ Complete |
| 9 | Student & Analytics APIs | ✅ Complete |
| 10 | Frontend ↔ Backend integration | ✅ Complete |
| 11 | Manager dashboard & analytics | ✅ Complete |
| 12 | Seed script & documentation | ✅ Complete |
| 13 | Input validation, rate limiting, centralized error handling | ✅ Complete |
| 14 | Automated backend tests (unit + API integration) | ✅ Complete |
| 15 | Student feedback and 1–5 star ratings | ✅ Implemented |
| 16 | Student reopening with mandatory reason | ✅ Implemented |

---

## 🔮 Future Enhancements

1. **Complaint Audit Log** — Track who changed what and when (full history)
2. **Email Notifications** — Send email alerts on status changes
3. **In-App Notifications** — Real-time push notifications via WebSockets
4. **Cloud File Uploads** — Store images on cloud storage (AWS S3 / Cloudinary)
   instead of inline data URLs
5. **Multi-Admin Roles** — Add roles like Warden, Maintenance Head with
   permission tiers
6. **Image Gallery** — Support multiple photos per complaint
7. **Export to CSV/PDF** — Download analytics reports and complaint data
8. **SLA Alerts** — Auto-flag overdue critical complaints
9. **End-to-End Browser Tests** — Playwright suites covering both mock and
   real-API modes
10. **Docker Deployment** — `docker-compose` for one-command backend + MongoDB
    startup
11. **Deployment** — Host on cloud platforms (Vercel for frontend, Render/Railway
    for backend, MongoDB Atlas for database)

---

## 📝 Conclusion

**HostelCare** successfully demonstrates a modern full-stack web application that
solves the real-world problem of hostel complaint management. The system provides:

- A **digitized, transparent** process replacing paper-based complaint tracking
- **Role-based access control** ensuring students and managers have appropriate
  permissions
- **Automatic prioritization** eliminating manual priority assignment errors
- **Real-time status tracking** giving students visibility into complaint progress
- **Analytics dashboards** enabling data-driven decision making for management
- **Student satisfaction feedback** through ratings and optional comments on resolved complaints
- **Complaint reopening** when a student reports an unresolved problem, with a recorded reason
- A **responsive, modern UI** that works across all devices
- **Security best practices** — JWT auth with configurable expiry, bcrypt
  password hashing, input validation, rate-limited auth routes and
  centralized error handling

The modular architecture (React frontend + Express REST API + MongoDB database)
follows industry best practices and is designed for easy extension and deployment.

---

## 📚 References

1. **React Documentation** — https://react.dev/
2. **Vite Documentation** — https://vite.dev/
3. **Tailwind CSS v4** — https://tailwindcss.com/
4. **Express.js** — https://expressjs.com/
5. **MongoDB Manual** — https://www.mongodb.com/docs/manual/
6. **Mongoose ODM** — https://mongoosejs.com/
7. **JSON Web Tokens (JWT)** — https://jwt.io/introduction
8. **bcrypt.js** — https://github.com/dcodeIO/bcrypt.js
9. **React Router** — https://reactrouter.com/
10. **Axios** — https://axios-http.com/
11. **Lucide Icons** — https://lucide.dev/
12. **Node.js** — https://nodejs.org/

---

## 📄 License

This project was developed for academic/educational purposes.

---

<div align="center">

**Built with ❤️ using React, Node.js, Express & MongoDB**

</div>
