# Language Exchange Platform

My IFQ636 Assignment 1 project, built on the unit's starter app (`nahaQUT/taskmanagerv1`).

The app helps people practise a language. You find someone who speaks the language you're learning, send them a partner request, and once they accept, you can book a practice session together. A moderator can hide a profile so it doesn't show up in search.

## Who can do what

- **Learner**: set up a profile with the languages you speak and are learning, search for partners, send and answer requests, book and cancel sessions
- **Moderator**: everything a learner can do, plus hide or restore a profile. You only become a moderator by running `backend/scripts/makeModerator.js`, so nobody can make themselves one in the app

## The two workflows

1. **Partner request** (this is the one on EC2): search by language and send a request. The other person accepts or declines it, or the sender cancels it. So a request is pending, accepted, declined or cancelled.
2. **Session booking**: once a request is accepted, either person can book a session, and cancel it before it starts.

## How it fits together

The front end is React, the back end is an Express API, and the data is stored in MongoDB Atlas (models `User`, `PartnerRequest` and `Session`). On the EC2 server, nginx serves the React app and passes `/api` requests on to the API, and pm2 keeps the API running.

Design pattern: **Middleware**. A protected request is checked before the controller runs. `protect` checks you're logged in, `requireRole` checks you're allowed (the moderator routes), and `validate` checks the input. If a check fails, you get an error and it stops there.

## Running it on your own computer

1. Use Node 22 (`nvm use`)
2. `npm install --prefix backend` and `npm install --prefix frontend`
3. Copy `backend/.env.example` to `backend/.env` and fill it in
4. `npm run dev --prefix backend`, then in a second terminal `npm start --prefix frontend`
5. Tests: `cd backend && npm test`

## Deployment

I deployed it by hand to the university's EC2 server (instance `i-06c16d4976fcfeafe`, Ubuntu 26.04). The steps are in `docs/DEPLOY.md`.

There's no public web address. The unit coordinator said on 3 Nov we don't need one, so the server only lets my IP in, and its address changes every time it restarts.

## Known limitations

- Nothing stops two sessions overlapping
- No notifications, so you have to reload to see changes, and reloading logs you out (I left the starter's login as it was)
- The starter's task feature is still in the API and its tests, but you can't get to it in the app
