# 💼 Job Portal — Full-Stack MERN Application

A full-featured job portal built with the MERN stack, supporting two user roles: **Students** (job seekers) and **Recruiters** (employers). Deployed as a monorepo on Render.com.

🔗 **Live Demo:** [job-portal-gtss.onrender.com](https://job-portal-gtss.onrender.com/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend State Management](#frontend-state-management)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Known Issues & Improvements](#known-issues--improvements)

---

## Features

### For Students
- Register and log in with role selection
- Browse and search jobs by keyword (title, description)
- Filter jobs by location, industry, and salary
- View detailed job descriptions
- Apply to jobs (duplicate applications blocked)
- Track applied jobs and their statuses (pending / accepted / rejected)
- Update profile: bio, skills, resume link, profile photo

### For Recruiters
- Register and manage companies (name, description, logo, website, location)
- Post new job listings with requirements, salary, type, and experience level
- View all applicants for each posted job
- Accept or reject applicants
- Dashboard to manage all posted jobs

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server and REST API |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Tokens (JWT) | Stateless authentication |
| bcryptjs | Password hashing (salt rounds: 10) |
| Multer (memory storage) | File upload handling |
| Cloudinary | Cloud media storage (photos, logos) |
| datauri | Buffer → base64 Data URI conversion |
| cookie-parser | Read cookies from requests |
| cors | Cross-Origin Resource Sharing |
| dotenv | Environment variable management |
| nodemon | Development auto-restart |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 6 | Build tool and dev server |
| React Router DOM v7 | Client-side routing |
| Redux Toolkit | Global state management |
| redux-persist | Persist Redux state to localStorage |
| Axios | HTTP client (withCredentials for cookies) |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component primitives |
| Framer Motion | Animation library |
| Sonner | Toast notifications |
| Lucide React | Icon library |

---

## Project Structure

```
job-portal/
├── package.json               # Root — build script orchestrates both
│
├── backend/
│   ├── index.js               # Express app entry point
│   ├── controllers/
│   │   ├── user.controller.js         # register, login, logout, updateProfile
│   │   ├── company.controller.js      # registerCompany, getCompany, updateCompany
│   │   ├── job.controller.js          # postJob, getAllJobs, getJobById, getAdminJobs
│   │   └── application.controller.js  # applyJob, getAppliedJobs, getApplicants, updateStatus
│   ├── models/
│   │   ├── user.model.js       # User schema (student | recruiter)
│   │   ├── company.model.js    # Company schema
│   │   ├── job.model.js        # Job schema with applications array
│   │   └── application.model.js # Application schema (pending|accepted|rejected)
│   ├── routes/
│   │   ├── user.route.js
│   │   ├── company.route.js
│   │   ├── job.route.js
│   │   └── application.route.js
│   ├── middlewares/
│   │   ├── isAuthenticated.js  # JWT cookie verification → injects req.id
│   │   └── multer.js           # singleUpload middleware (memory storage)
│   └── utils/
│       ├── db.js               # MongoDB connection via mongoose.connect()
│       ├── cloudinary.js       # Cloudinary SDK configuration
│       └── datauri.js          # Converts Multer buffer to base64 Data URI
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx             # Router definition (all routes)
        ├── main.jsx            # React root with Redux Provider + PersistGate
        ├── utils/
        │   └── constant.js     # API base URL constants
        ├── redux/
        │   ├── store.js        # Combined + persisted Redux store
        │   ├── authSlice.js    # { loading, user }
        │   ├── jobSlice.js     # { allJobs, singleJob, allAdminJobs, searchedQuery, ... }
        │   ├── companySlice.js # { companies, singleCompany }
        │   └── applicationSlice.js # { applicants }
        ├── hooks/
        │   ├── useGetAllJobs.jsx          # Fetches all jobs → dispatches setAllJobs
        │   ├── useGetAllAdminJobs.jsx     # Fetches recruiter's own jobs
        │   ├── useGetAllCompanies.jsx     # Fetches recruiter's companies
        │   ├── useGetAppliedJobs.jsx      # Fetches student's applied jobs
        │   └── useGetCompanyById.jsx      # Fetches single company by param ID
        └── components/
            ├── shared/         # Navbar, Footer
            ├── auth/           # Login, Signup
            ├── ui/             # shadcn/ui primitives (button, dialog, badge, ...)
            ├── admin/          # ProtectedRoute, Companies, AdminJobs, Applicants, ...
            ├── Home.jsx        # Landing page
            ├── Jobs.jsx        # Job listing with FilterCard
            ├── Browse.jsx      # Search results
            ├── Profile.jsx     # User profile with UpdateProfileDialog
            ├── JobDescription.jsx  # Single job detail + apply button
            ├── FilterCard.jsx  # Radio group filter (dispatches to Redux)
            ├── CategoryCarousel.jsx
            ├── HeroSection.jsx
            └── AppliedJobTable.jsx
```

---

## Architecture Overview

```
Browser (React SPA)
     │  axios + cookies
     ▼
Express API Server (Node.js)
     │  isAuthenticated middleware (JWT)
     │
     ├─ /api/v1/user/*       →  user.controller.js
     ├─ /api/v1/company/*    →  company.controller.js
     ├─ /api/v1/job/*        →  job.controller.js
     └─ /api/v1/application/* → application.controller.js
           │
           ├──▶ MongoDB (Mongoose models: User, Company, Job, Application)
           └──▶ Cloudinary (profile photos, company logos via Multer → datauri)

GET /* (non-API)  →  serves frontend/dist/index.html  (SPA fallback)
```

---

## Database Schema

### User
```js
{
  fullname: String,           // required
  email: String,              // required, unique
  phoneNumber: Number,        // required
  password: String,           // required, bcrypt-hashed
  role: "student" | "recruiter",
  profile: {
    bio: String,
    skills: [String],         // comma-separated on input, stored as array
    resume: String,           // Google Drive or external URL
    company: ObjectId → Company,
    profilePhoto: String      // Cloudinary URL
  },
  timestamps: true
}
```

### Company
```js
{
  name: String,               // required, unique
  description: String,
  website: String,
  location: String,
  logo: String,               // Cloudinary URL
  userId: ObjectId → User,    // recruiter who owns the company
  timestamps: true
}
```

### Job
```js
{
  title: String,              // required
  description: String,        // required
  requirements: [String],     // comma-separated on input
  salary: Number,             // required
  experienceLevel: Number,    // required
  location: String,           // required
  jobType: String,            // required (Full-time, Part-time, etc.)
  position: Number,           // number of open positions
  company: ObjectId → Company,
  created_by: ObjectId → User,
  applications: [ObjectId → Application],
  timestamps: true
}
```

### Application
```js
{
  job: ObjectId → Job,
  applicant: ObjectId → User,
  status: "pending" | "accepted" | "rejected",  // default: "pending"
  timestamps: true
}
```

---

## API Reference

All protected routes require the `token` cookie (set on login). All responses follow `{ success: Boolean, message: String, data? }`.

### User  `/api/v1/user`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | ❌ | Register new user. Accepts `multipart/form-data` for optional profile photo. |
| POST | `/login` | ❌ | Login. Sets `token` cookie (1 day). Returns user object. |
| GET | `/logout` | ❌ | Clears the `token` cookie. |
| POST | `/profile/update` | ✅ | Update profile fields + optional photo upload. |

### Company  `/api/v1/company`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | ✅ | Create a new company (name only at creation). |
| GET | `/get` | ✅ | Get all companies belonging to the logged-in recruiter. |
| GET | `/get/:id` | ✅ | Get a single company by ID. |
| PUT | `/update/:id` | ✅ | Update company info + upload logo. |

### Job  `/api/v1/job`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/post` | ✅ | Create a new job listing (recruiter only). |
| GET | `/get?keyword=` | ✅ | Get all jobs. Optional keyword searches title and description via `$regex`. |
| GET | `/get/:id` | ✅ | Get a single job by ID, populating applications. |
| GET | `/getadminjobs` | ✅ | Get all jobs posted by the authenticated recruiter. |

### Application  `/api/v1/application`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/apply/:id` | ✅ | Apply to a job (student). Checks for duplicate application. |
| GET | `/get` | ✅ | Get all jobs the student has applied to (with company info). |
| GET | `/:id/applicants` | ✅ | Get all applicants for a given job (recruiter). |
| POST | `/status/:id/update` | ✅ | Update application status (pending/accepted/rejected). |

---

## Frontend State Management

State is managed with Redux Toolkit, persisted to localStorage via redux-persist.

```
store (persisted to localStorage under key "root")
├── auth:        { loading: Boolean, user: Object | null }
├── job:         { allJobs, singleJob, allAdminJobs, searchedQuery,
│                  allAppliedJobs, searchJobByText }
├── company:     { companies, singleCompany }
└── application: { applicants }
```

**Custom Hooks** handle data fetching on component mount. They call axios, then dispatch the result to Redux:
- `useGetAllJobs` — fetches with `searchedQuery` as keyword
- `useGetAppliedJobs` — fetches student's applied jobs
- `useGetAllCompanies` — fetches recruiter's companies
- `useGetAllAdminJobs` — fetches recruiter's posted jobs
- `useGetCompanyById` — fetches single company by URL param

**ProtectedRoute** wraps all `/admin/*` routes. On mount it checks `user.role === 'recruiter'` in Redux state. If the check fails, it navigates to `/`.

**Client-side filtering** in `Jobs.jsx` — the `FilterCard` component dispatches `setSearchedQuery` which triggers a `useEffect` in `Jobs.jsx` to filter `allJobs` locally by title, description, and location.

---

## Environment Variables

Create a `.env` file in the `/backend` directory:

```env
PORT=8000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/job-portal

SECRET_KEY=your_jwt_secret_key

CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd job-portal

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Create backend .env file (see Environment Variables section)

# 5. Update API base URL for local dev
# In frontend/src/utils/constant.js, change to:
# export const USER_API_END_POINT = "http://localhost:8000/api/v1/user";
# (and similarly for the other endpoints)

# 6. Run backend (from root)
npm run dev

# 7. Run frontend (from /frontend)
cd frontend && npm run dev
```

The backend runs on `http://localhost:8000` and the frontend dev server on `http://localhost:5173`.

### Production Build

```bash
# From root — installs both, builds the frontend
npm run build

# Then start the server
npm start
```

---

## Deployment

This project is deployed on **Render.com** as a single Web Service.

**Build command:** `npm run build`  
(Runs `npm install && npm install --prefix frontend && npm run build --prefix frontend`)

**Start command:** `npm start`  
(Runs `nodemon backend/index.js`)

The Express server serves `frontend/dist` as static files and uses a regex catch-all route to return `index.html` for all non-API paths, enabling client-side routing.

Add all environment variables from the `.env` section in Render's dashboard under **Environment**.

---

## Known Issues & Improvements

| Issue | Description |
|-------|-------------|
| `applyJob` uses GET | Should be POST — GET requests should be idempotent and not create database records |
| No role-based authorization on routes | Backend doesn't verify `user.role`; a student could technically POST to `/api/v1/job/post` |
| No server-side input validation | No Joi/Zod/express-validator middleware; validation is done ad-hoc in controllers |
| No pagination | `getAllJobs` returns all documents; will degrade with large datasets |
| `updateCompany` crashes without file | `getDataUri(req.file)` throws if no file is uploaded; needs a null check |
| API URL hardcoded | `frontend/src/utils/constant.js` contains a hardcoded Render URL; should use env vars |
| `httpOnly` typo | Cookie option is set as `httpsOnly: true` — the correct option is `httpOnly: true` |
| Skills CSV format | Skills are stored/sent as comma-separated strings; the split is inconsistent between register and updateProfile |
| No email verification | Users can register with any email without verification |
| No refresh token strategy | JWT tokens expire after 1 day with no refresh mechanism |
