# LifeOS

> AI-powered personal operating system — productivity, wellness, digital wellbeing, community, and AI coaching in one unified platform.

## Project Structure

```
LifeOS/
├── lifeos-client/    # Next.js frontend (TypeScript, Tailwind CSS, shadcn/ui)
├── lifeos-server/    # Express backend (TypeScript, MongoDB, Mongoose)
└── README.md
```

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

## Quick Start

### Frontend

```bash
cd lifeos-client
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd lifeos-server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run dev
# → http://localhost:5000
```

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | Next.js, TypeScript, Tailwind CSS, shadcn/ui   |
| Backend     | Node.js, Express.js, TypeScript                |
| Database    | MongoDB Atlas, Mongoose                        |
| Auth        | JWT (access + refresh tokens), bcrypt           |
| State       | Zustand (client), TanStack Query (server)       |
| AI          | BYOK — OpenAI, Gemini, Claude, Groq, OpenRouter |
| Storage     | Cloudinary                                      |
| Deployment  | Vercel (frontend), Render/Railway (backend)     |

## Development Rules

- **Database First**: Schema → Model → Repository → Service → Controller → Routes → Frontend
- **Zero Fake Data**: Every displayed value must come from real database records
- **API First**: Frontend never communicates directly with MongoDB
- **One feature at a time**: Complete before moving to the next

## Documentation

All project specifications are maintained in the `/docs` directory (`.docx` format).

## License

Private — All rights reserved.
