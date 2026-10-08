# snip.link — URL Shortener

A minimal full-stack URL shortener built as a 45-minute workshop project.

**Stack:** React (Vite) + Node.js (Express) + SQLite + Minimoth OTP auth

---

## Project Structure

```
url-shortener/
├── backend/          # Express API
│   ├── index.js      # Entry point + redirect endpoint
│   ├── db.js         # SQLite setup (users, sessions, links)
│   ├── middleware.js  # Auth token check
│   ├── routes/
│   │   ├── auth.js   # POST /auth/send-otp, POST /auth/verify-otp
│   │   └── links.js  # POST /links, GET /links
│   ├── .env.example
│   └── package.json
└── frontend/         # React + Vite
    ├── src/
    │   ├── api.js            # Fetch helpers
    │   ├── App.jsx           # Root with simple state routing
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── HomePage.jsx
    │       └── LinksPage.jsx
    ├── .env.example
    └── package.json
```

---

## Setup & Running

### 1. Backend

```bash
cd backend

# Copy env and fill in your values
cp .env.example .env
# Edit .env:
#   MINIMOTH_API_KEY=mm_live_...  (get from app.minimoth.dev)
#   JWT_SECRET=some-random-secret

npm install
npm run dev        # starts on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend

# Copy env (defaults to http://localhost:3001)
cp .env.example .env

npm install
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Path                  | Auth? | Description              |
|--------|-----------------------|-------|--------------------------|
| POST   | `/auth/send-otp`      | No    | Send OTP via Minimoth    |
| POST   | `/auth/verify-otp`    | No    | Verify OTP, get token    |
| POST   | `/links`              | Yes   | Shorten a URL            |
| GET    | `/links`              | Yes   | List user's links        |
| GET    | `/:code`              | No    | Redirect short URL       |

---

## Getting a Minimoth API Key

1. Sign up at [app.minimoth.dev/register](https://app.minimoth.dev/register)
2. Create a project → copy the API key
3. For testing, use the **sandbox key** (`mm_test_...`) — no real OTPs are sent

---

## Database

SQLite file (`backend/data.db`) is created automatically on first run. Three tables:

- **users** — phone, created_at
- **sessions** — access_token, refresh_token from Minimoth
- **links** — original_url, short_code, clicks, user_id
