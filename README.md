# Language Exchange Platform

IFQ636 Assignment 1. Built on the unit starter (`nahaQUT/taskmanagerv1`).

Learners find someone who speaks the language they're learning, send them a partner request, and once it's accepted they can book practice sessions. Moderators can hide a profile from search.

## Roles

- **Learner**: language profile, search for partners, send and answer requests, book and cancel sessions
- **Moderator**: same as a learner, plus hide or restore profiles. You make someone a moderator with `backend/scripts/makeModerator.js`, so nobody can give themselves the role through the app

## Workflows

1. **Partner request** (this is the one on EC2): search by language, send a request, the other person accepts or declines, or the sender cancels it. A request is pending, accepted, declined or cancelled.
2. **Session booking**: once a request is accepted, either person can book a session, and cancel it before it starts.

## How it fits together

React front end, Express API, MongoDB Atlas database (Mongoose models `User`, `PartnerRequest`, `Session`). On EC2, nginx serves the React build and sends `/api` requests to the API, which pm2 keeps running.

Design pattern: **Middleware**. Protected routes go through `protect` (logged in?), then `requireRole` (allowed?), then `validate` (is the input ok?) before the controller runs. If a check fails, the request stops there with an error.

## Running it locally

1. Node 22 (`nvm use`)
2. `npm install --prefix backend` and `npm install --prefix frontend`
3. Copy `backend/.env.example` to `backend/.env` and fill it in
4. `npm run dev --prefix backend`, then in another terminal `npm start --prefix frontend`
5. Tests: `cd backend && npm test`

## Deployment

Deployed by hand to the university EC2 instance `i-06c16d4976fcfeafe` (Ubuntu 26.04). Steps are in `docs/DEPLOY.md`.

There's no public URL. The unit coordinator said on 3 Nov one isn't needed, so the instance only accepts my IP, and its IP changes every time it restarts.

## Known limitations

- No check for overlapping sessions
- No notifications. To see changes you need to reload, and that logs you out
- Login isn't kept after a page refresh (the starter's login is left as it was)
- The starter's task feature is still in the API (and its tests), but it isn't linked in the UI
