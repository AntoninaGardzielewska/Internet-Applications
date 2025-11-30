# Simple React App

A minimal React app scaffolded to work with Vite. This small demo shows a basic component structure, static data, and an images folder for local assets.

## Features

- Single-page React app using Vite for development and build
- Small component layout: header and entry component
- Local `data.js` for demo content and an `Images/` folder for assets

## Tech stack

- React (JSX)
- Vite
- Node.js / npm

## Prerequisites

- Node.js 16 or newer recommended
- npm (comes with Node)

## Quick start

1. Install dependencies

```bash
cd Simple-React-App
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

If your environment uses `pnpm` or `yarn`, you can use them instead of `npm`.

## Available scripts (from `package.json`)

- `dev` — start Vite dev server
- `build` — create production build
- `preview` — locally preview the production build

## Project structure

```
Simple-React-App/
├─ App.jsx          # Main app component
├─ index.jsx        # App entry and mount point
├─ index.html       # HTML template used by Vite
├─ package.json
├─ vite.config.js
├─ data.js          # Demo data used by the app
├─ index.css        # Basic styles
├─ components/
│  ├─ Header.jsx    # Header component
│  └─ Entry.jsx     # Entry list / card component
└─ Images/          # Local image assets (used by demo)
```

## Components

- `Header.jsx` — top bar / title for the sample app.
- `Entry.jsx` — individual entry or card that renders content from `data.js`.

## Notes
- If images do not load, verify paths in `Images/` and that components reference them with the correct relative path.

Thanks to Antoni Mrowiński for sharing his images