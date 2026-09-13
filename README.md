# BidRakshak

BidRakshak is a procurement compliance prototype designed to help officers review tender requirements, map evidence, assess risk, and generate an audit-ready report.

## Features
- Tender overview and bidder information
- Requirement-by-requirement compliance tracking
- Evidence and verification review
- Risk scoring and review queue
- Audit-ready report generation
- Demo authentication and seeded procurement data

## Stack
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React + TypeScript + Vite

## Quick start

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## Demo login
- Email: demo@bidrakshak.gov.in
- Password: BidRakshak@123

## Demo URL
- Frontend: http://localhost:5173
- Backend: http://localhost:8000/docs

## Notes
This is a prototype built for demonstration and evaluation. It uses deterministic seeded data to simulate a realistic procurement compliance workflow.
