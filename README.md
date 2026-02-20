# Inventory Management System

A full-stack inventory management application designed to manage inventory and end-of-shift workflows for instructors, while giving admins visibility and control over storage units and supplies. It bridges the gap between admins and instructors, allowing both roles to interact with the same inventory data in role-appropriate ways.

## Tech Stack

### Backend
- Python
- Flask
- PostgreSQL

### Frontend
- React
- Vite
- Tailwind CSS

---

## Running Locally

**Clone the repo:**
```bash
git clone https://github.com/Ruby-Franco/myinventory.git
cd myinventory
```

**Create and activate a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows
```

**Install backend dependencies:**
```bash
pip install -r requirements.txt
```

**Set up environment variables:**

Create a `backend/.env` file with the following:
```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

**Initialize the database (first time only):**
```bash
python
>>> from app import db
>>> db.create_all()
>>> exit()
```

**Open a split terminal — one for frontend, one for backend.**

In the frontend terminal:
```bash
cd frontend
npm install
npm run dev
```

In the backend terminal:
```bash
cd backend
python app.py
```

Both terminals need to be running. Then open http://localhost:5173 in your browser.

For local development, make sure the API URL in your frontend is set to:
```js
const API_URL = "http://127.0.0.1:5000";
```

---

## Deployment

This project is deployed using **Railway** for the backend and database, and **Vercel** for the frontend.

### Backend (Railway)
1. Create a new project on [Railway](https://railway.app)
2. Add your Flask app as a service connected to your GitHub repo
3. Add a PostgreSQL database service in Railway
4. Set the following environment variables in Railway's dashboard:
   - `DATABASE_URL` (Railway provides this automatically when you add Postgres)
   - `SECRET_KEY`
5. Make sure your project has a `Procfile` in the backend root:
   ```
   web: gunicorn app:app
   ```
6. Railway will provide you with a public URL once deployed (e.g. `myinventory-production.up.railway.app`)

### Frontend (Vercel)
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set the root directory to `frontend/`
3. Once your Railway backend is live, update the API URL in the following files:
   - `Dashboard.jsx`
   - `Login.jsx`
   - `InstructorDashboard.jsx`
   - `ShiftSurvey.jsx`

   Change:
   ```js
   const API_URL = "http://127.0.0.1:5000";
   ```
   To your Railway backend URL:
   ```js
   const API_URL = "https://myinventory-production.up.railway.app";
   ```

4. Deploy on Vercel — your frontend will be live at a `vercel.app` URL.