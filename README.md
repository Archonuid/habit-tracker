# Mythlog

Mythlog is a habit-tracker app that turns your daily habits into quests and your
life into an epic story. Built with **Next.js** (App Router) + **Tailwind CSS v4**.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server (http://localhost:3000).

Run `npm run build` to produce a production build, then `npm start` to serve it.

## Project structure

```
src/
├── app/
│   ├── (auth)/            ← landing / auth page  (route: /)
│   ├── (onboarding)/      ← archetype, username, familiar, interests
│   ├── (app)/             ← home, tracker, journal, profile
│   ├── api/               ← familiar/chat, journal/generate, xp/update
│   ├── components/        ← ui, figma, auth, status-window, familiar, tracker, journal
│   ├── lib/               ← constants (ARCHETYPES + FLOATING_CHIPS)
│   └── layout.tsx         ← root layout (imports global styles)
└── styles/               ← fonts, tailwind, theme
```
