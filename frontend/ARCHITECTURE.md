# Life OS Tracker — React Vite Frontend

## Stack
- **React 18** + **Vite** — fast dev server, HMR
- **Tailwind CSS v3** — utility-first styling
- **Axios** — HTTP client with JWT interceptors
- **React Router v6** — client-side routing
- **Zustand** — lightweight auth state management
- **React Query (TanStack)** — server state, caching, background refetch

## Folder Structure
```
frontend/src/
├── api/
│   ├── axios.js          ← Central Axios instance + JWT interceptors
│   ├── auth.js           ← Login / refresh / logout calls
│   ├── performance.js    ← Performance pillar CRUD
│   ├── wealth.js         ← Wealth pillar CRUD
│   └── tech.js           ← Tech pillar CRUD
├── components/
│   ├── common/           ← Button, Card, Badge, Loader, Modal
│   └── pillars/          ← PillarCard, StreakBadge, LogForm
├── hooks/
│   ├── useAuth.js        ← Auth state + login/logout helpers
│   └── useApi.js         ← Generic useQuery / useMutation wrapper
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── pillars/
│       ├── Performance.jsx
│       ├── Wealth.jsx
│       └── Tech.jsx
├── store/
│   └── authStore.js      ← Zustand store for tokens + user
├── utils/
│   └── tokenStorage.js   ← localStorage helpers for tokens
├── App.jsx               ← Router + protected routes
├── main.jsx
└── index.css             ← Tailwind directives + custom tokens
```
