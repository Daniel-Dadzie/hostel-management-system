# Hostel Management System (Frontend)

## Theme

- Primary (green): Tailwind `primary-*` (green scale / forest)
- Accent (gold): Tailwind `accent-*` (amber scale)
- Neutral (black/gray): Tailwind `neutral-*` (slate scale)
- Cream surfaces: Tailwind `cream-*` (stone scale)
- Dark mode: class-based (`dark` on the `html` element)

## Dev

```bash
npm install
npm run dev
```

Vite runs on `http://localhost:5173`.

## API connection

The app calls the backend using `VITE_API_BASE_URL`.

Create `.env` from `.env.example` if needed:

```bash
cp .env.example .env
```

Default local API URL:

```env
VITE_API_BASE_URL=http://localhost:8080
```
