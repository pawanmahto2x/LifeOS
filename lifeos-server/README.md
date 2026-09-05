# LifeOS Server

> Express.js + TypeScript + MongoDB backend for LifeOS.

## Prerequisites

- Node.js >= 18.x
- MongoDB Atlas account (or local MongoDB)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |

## Architecture

```
src/
├── config/         # Database, environment config
├── controllers/    # Request handlers (thin)
├── middleware/     # Auth, validation, error handling
├── models/         # Mongoose schemas
├── repositories/   # Database access layer
├── routes/         # API route definitions
├── services/       # Business logic
├── utils/          # Helpers, JWT utilities
├── validators/     # Zod validation schemas
├── types/          # TypeScript interfaces
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## API

- Health check: `GET /api/health`
- All endpoints documented in API.md
