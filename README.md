# SWE_lab

This repository now has two frontends against the same Django backend:

- The original Django template UI at `http://localhost:8000`
- A new React + Vite frontend at `http://localhost:5173`

The Django backend remains responsible for models, session authentication, and business logic. The React app consumes new Django REST Framework endpoints under `/api/`.

## Backend setup

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations and start Django:

```bash
python manage.py migrate
python manage.py runserver
```

Open:

- Django templates: `http://localhost:8000`
- Django admin: `http://localhost:8000/admin/`
- API examples:
  - `http://localhost:8000/api/listings/`
  - `http://localhost:8000/api/categories/`
  - `http://localhost:8000/api/auth/me/`

## Frontend setup

Install frontend dependencies and run Vite:

```bash
cd frontend
npm install
npm run dev
```

Open the React app at `http://localhost:5173`.

## Authentication

- Django session authentication is still used.
- Existing Django pages remain active:
  - `http://localhost:8000/login`
  - `http://localhost:8000/register`
  - `http://localhost:8000/logout`
- The React app sends cookies to Django and uses a CSRF bootstrap endpoint for authenticated POST requests.

## API endpoints

- `GET /api/listings/`
- `POST /api/listings/`
- `GET /api/listings/<id>/`
- `POST /api/listings/<id>/bid/`
- `POST /api/listings/<id>/comment/`
- `POST /api/listings/<id>/watchlist/`
- `POST /api/listings/<id>/close/`
- `GET /api/watchlist/`
- `GET /api/categories/`
- `GET /api/auth/me/`
- `GET /api/auth/csrf/`

## Production notes

Local development is designed around two servers:

- Django on `http://localhost:8000`
- React on `http://localhost:5173`

To build the React frontend for production-style static output:

```bash
cd frontend
npm run build
```

That produces assets in `frontend/dist/`. Integrating those assets into Django can be handled later if you want a single deployed app, but it is intentionally left simple for local development.

## Docker deployment (VPS)

This repo now includes:

- `Dockerfile` for Django backend (Gunicorn + migrations + collectstatic on startup)
- `frontend/Dockerfile` for React build + Nginx runtime
- `docker-compose.yml` for orchestrating both services

Run on your VPS:

```bash
cp .env.example .env
docker compose up -d --build
```

Access:

- App: `http://<your-vps-ip-or-domain>/`
- Django admin: `http://<your-vps-ip-or-domain>/admin/`

Stop services:

```bash
docker compose down
```
