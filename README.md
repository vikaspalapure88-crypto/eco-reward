# EcoReward – Clean Environment, Earn Rewards

A modern eco-friendly web application that motivates users to clean public spaces, collect waste, and earn reward points convertible to real money through UPI-driven withdrawals.

## Features

- User registration and login system
- Camera-based cleaning photo upload and verification flow
- GPS-based activity tracking with live map view
- Reward point system and leaderboard
- UPI withdrawal simulation with secure admin approval flow
- User dashboard and admin dashboard
- Modern green and white eco theme
- Responsive mobile-first UI

## Tech Stack

- Frontend: React.js + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB-ready with in-memory demo fallback for local prototype testing
- Maps: Leaflet + browser geolocation
- Authentication: secure registration/login flow demo
- Image capture: browser camera/file input support

## Folder Structure

```bash
eco-reward/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── index.css
└── server/
    ├── package.json
    ├── index.js
    └── data/
        └── demoData.js
```

## Quick Start

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
npm --prefix client install
```

3. Install backend dependencies:

```bash
npm --prefix server install
```

4. Copy the environment sample:

```bash
cp .env.example .env
```

5. Start the backend:

```bash
npm --prefix server run dev
```

6. Start the frontend:

```bash
npm --prefix client run dev
```

7. Open the app:

```text
http://localhost:5173
```

## Demo Credentials

- User: `demo@ecoreward.in` / `demo1234`
- Admin: `admin@ecoreward.in` / `admin1234`

## Notes

- The app includes demo data to make the prototype usable immediately.
- For live verification, configure a MongoDB connection in `.env` using `MONGO_URI`.
- UPI withdrawal processing is simulated and marked as pending until admin approval.
- Payment success is never claimed unless a real provider confirms settlement.

## Project Goal

EcoReward is designed to encourage clean public spaces, protect the environment, and reward citizens with real money rewards for verified eco-friendly actions.
