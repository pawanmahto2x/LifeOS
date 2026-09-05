# LifeOS Client

> Next.js + TypeScript + Tailwind CSS frontend for LifeOS.

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Architecture

```
src/
├── app/                # Next.js App Router pages
├── components/         # Shared UI components
│   └── ui/             # shadcn/ui components
├── features/           # Feature modules (tasks/, habits/, etc.)
│   └── <feature>/
│       ├── components/ # Feature-specific components
│       ├── hooks/      # Feature-specific hooks
│       ├── services/   # Feature API service
│       ├── types/      # Feature types
│       └── utils/      # Feature utilities
├── hooks/              # Global custom hooks
├── layouts/            # Layout components
├── lib/                # Utility libraries (axios client, etc.)
├── providers/          # Context/theme/query providers
├── services/           # Global API service functions
├── store/              # Zustand stores
├── styles/             # Global styles
├── types/              # Shared TypeScript types
└── utils/              # Helper utilities
```

## State Management

- **Zustand**: Client state (user session, theme, sidebar)
- **TanStack Query**: Server state (tasks, habits, reports)
- Server data must never be duplicated in Zustand stores

## UI Libraries

- shadcn/ui — Component primitives
- Framer Motion — Animations
- Lenis — Smooth scroll
- Lucide React + IconSax — Icons
- Lottie React — Vector animations
- Magic UI — Advanced components
- Recharts — Charts

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
