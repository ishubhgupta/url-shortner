# URL Shortener Frontend (minimal scaffold)

This is a minimal Vite + React frontend scaffold for the URL shortener backend.

Quick start:

1. From the `frontend` folder, install dependencies:

```bash
cd frontend
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open http://localhost:5173 (Vite default) and use the UI.

Notes:
- The app expects the backend at `http://localhost:5000`. You can change `REACT_APP_API_BASE` to point to a different API base.
- Tailwind is referenced in devDependencies but not fully configured—`styles.css` contains minimal CSS so the UI works without Tailwind setup.
