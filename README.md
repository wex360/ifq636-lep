# Language Exchange Platform

IFQ636 Assignment 1, built on the unit's MERN starter (`nahaQUT/taskmanagerv1`). Learners find a
partner who speaks the language they are learning, send a partner request, and book practice sessions
once it is accepted. Moderators can hide a profile from search.

## Roles and workflows

- **Learner**: language profile, partner search, requests, sessions
- **Moderator**: everything a learner can do, plus hide or restore profiles. Promoted by
  `backend/scripts/makeModerator.js`; the API never lets a user choose their own role
- **Workflow 1, partner request** (deployed to EC2): search by language, send, accept or decline,
  cancel. States: pending, accepted, declined, cancelled
- **Workflow 2, session booking**: book with an accepted partner,
  cancel before it starts

## Architecture

React (Create React App, Tailwind) talks to an Express API over `/api`; Mongoose models
`User`, `PartnerRequest` and `Session` in MongoDB Atlas. On EC2, nginx serves the build and
proxies `/api` to the API under pm2 (`docs/DEPLOY.md`).

Design pattern: **Middleware (chain of responsibility)**. Every protected route passes through
`protect` (JWT), then `requireRole` where a role is needed, then `validate`, before the controller
runs. Each link either ends the request with 401, 403 or 400, or hands on to the next, so controllers
only see authenticated, authorised, valid input.

## Run locally

1. Node 22 (`nvm use`)
2. `npm install --prefix backend && npm install --prefix frontend`
3. `backend/.env` from `backend/.env.example`
4. `npm run dev --prefix backend` and, in a second terminal, `npm start --prefix frontend`
5. Tests: `cd backend && npm test`

## Known limitations

- No public URL: per the unit coordinator's 3 Nov ruling, the EC2 instance is reached from My IP and by
  the marker through the university account; its IP changes when it restarts (`docs/DEPLOY.md`)
- Session times have no overlap check
- No real-time notifications; pages show changes on reload
- The starter's task feature remains in the API and its tests are kept; it is not linked in the UI

## Deployment

See `docs/DEPLOY.md`.
