# SkillBarter 🎓

SkillBarter is a polished peer-to-peer skill exchange platform built with **React**, **Vite**, **Tailwind CSS**, **Flask**, and **MongoDB**. The app helps learners and mentors connect through skill matching, private chat, and gamified progress tracking.

## Project Overview

- **Users** can log in, manage their profile, and list skills they want to teach or learn.
- **Matching** is powered by skill similarity logic to surface relevant peer-to-peer matches.
- **Chat** sessions are delivered in real time using Socket.IO.
- **Gamification** encourages participation with badges, points, and leaderboard data.

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, Socket.IO client
- Backend: Flask, Flask-SocketIO, Flask-JWT-Extended, PyMongo, python-dotenv
- Database: MongoDB Atlas

## Prerequisites

- Python 3.11+ (recommended)
- Node 18+ / npm
- MongoDB Atlas or local MongoDB instance

## Environment Variables

Copy example files before starting the app:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### `backend/.env.example`
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillbarter?retryWrites=true&w=majority
JWT_SECRET_KEY=replace-with-a-secure-secret
CORS_ORIGINS=http://localhost:5173
FLASK_DEBUG=true
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
```

### `frontend/.env.example`
```env
VITE_API_URL=http://localhost:5000
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend will be available at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Run Both Together

Use the helper script from the repository root:

```bash
python run.py
```

You can also launch it from the backend folder if you are already inside `backend`:

```bash
cd backend
python run.py
```

This script will:
- create the backend virtual environment if needed
- install backend Python dependencies
- start the Flask backend
- install frontend Node dependencies
- start the Vite development server

## API Reference

### Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Authenticate and receive a JWT token
- `GET /api/auth/me` — Get the current user profile (requires JWT)
- `PATCH /api/auth/update` — Update profile details (requires JWT)

### Skills
- `GET /api/skills` — Retrieve user skills (requires JWT)
- `POST /api/skills/teach` — Add a teach skill (requires JWT)
- `POST /api/skills/learn` — Add a learn skill (requires JWT)

### Matching
- `GET /api/matches` — Get recommended matches (requires JWT)

### Sessions
- `GET /api/sessions` — Get active chat sessions (requires JWT)

### Gamification
- `GET /api/gamification` — Get points and badges (requires JWT)

## Notes

- This repo uses environment-based configuration for local and production workflows.
- The frontend uses `VITE_API_URL` to connect to the backend.
- The backend supports CORS for the frontend origin by default.

## License

This project is licensed under the MIT License.
