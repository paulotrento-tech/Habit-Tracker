# Habit Tracker

A full-stack web app for tracking daily habits, built to replace a Google Sheets habit tracker and accessible from any device, including iOS Safari.

**Live app:** https://habit-tracker-alpha-ten-93.vercel.app

## Features

- Email/password authentication (JWT-based, bcrypt password hashing)
- Create, view, edit, and delete habits
- Log daily entries per habit, with fields specific to each type (Duolingo lessons, reading pages, exercise sets/reps/weight, running miles)
- Automatic streak calculation (consecutive completed days)

## Tech Stack

- **Frontend:** React (Vite), React Router
- **Backend:** FastAPI (Python), SQLAlchemy
- **Database:** PostgreSQL (hosted on Neon)
- **Auth:** JWT tokens, bcrypt password hashing
- **Hosting:** Vercel (frontend), Render (backend)

## Project Structure

- habit-tracker/
- backend/
- app/
- main.py FastAPI app + CORS
- database.py DB connection
- models.py SQLAlchemy models (User, Habit, Log)
- schemas.py Pydantic request/response schemas
- auth.py Password hashing + JWT
- dependencies.py Shared DB session + current-user dependency
- routers/ auth, habits, logs endpoints
- schema.sql Raw SQL table definitions
- requirements.txt
- frontend/
- src/
- pages/ LoginPage, HabitsPage, AddHabitPage, HabitDetailPage
- AuthContext.jsx Shared login state
- Layout.jsx Shared header/nav
- RequireAuth.jsx Route protection

## Local Development

### Backend

- cd backend
- python -m venv venv
- .\venv\Scripts\Activate.ps1
- pip install -r requirements.txt

create a .env file with DATABASE_URL and SECRET_KEY

- uvicorn app.main:app --reload

### Frontend

- cd frontend
- npm install

create a .env.local file with VITE_API_URL=http://127.0.0.1:8000

- npm run dev

## Deployment

- Frontend on Vercel, root directory `frontend/`
- Backend on Render, root directory `backend/`
- Database on Neon (PostgreSQL)

## Status

Core app complete: auth, full CRUD on habits and logs, streak tracking, deployed and live. A visual styling pass is the one remaining planned item.