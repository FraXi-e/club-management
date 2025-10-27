# IIIT-NR Club Portal (MySQL backend)

This backend uses Node.js + Express + Sequelize (MySQL) and provides REST endpoints for clubs, events and memberships.

Setup
1. Copy `.env.example` to `.env` and update DB credentials.
2. Install dependencies:

```powershell
cd server_mysql
npm install
```

3. Seed database (this will drop existing tables):

```powershell
npm run seed
```

4. Start server:

```powershell
npm run dev
```

API endpoints are available under `/api` (e.g. `GET /api/clubs`).

Note: The frontend attempts to POST support tickets to `POST /api/support`. The server scaffold does not include a dedicated support controller by default; you can either add one or rely on the frontend localStorage fallback.

Troubleshooting:
- If the server fails to connect, ensure MySQL is running and `.env` contains correct DB credentials.
- To reset demo data, run `npm run seed` which uses `sequelize.sync({ force: true })`.
