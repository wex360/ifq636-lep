# Manual deployment to the university EC2 (LEP-14)

One server runs everything. nginx serves the React app on port 80 and passes `/api` requests to the
Express API on port 5001, and pm2 keeps the API running. The database is MongoDB Atlas. Nothing is
automated, so every step below is done by hand.

Server: Ubuntu 26.04, t3.medium, 32 GB disk. Security group: SSH (22) and HTTP (80) from my IP only.
The unit coordinator said on 3 Nov we don't need a public URL or a rule open to everyone (0.0.0.0/0).

## First deployment

1. Connect: `ssh -i ~/.ssh/<key> ubuntu@<public-ip>`
2. Packages: `sudo apt update && sudo apt install -y nginx git build-essential`
3. Node 22 and pm2:
   `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`, reopen the
   shell, then `nvm install 22 && npm install -g pm2`
4. Code: `git clone https://github.com/wex360/ifq636-lep.git && cd ifq636-lep`
5. Install and build:
   `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
6. Secrets, never committed: create `backend/.env` with `MONGO_URI=...`, `JWT_SECRET=` the output of
   `openssl rand -base64 32`, and `PORT=5001`
7. nginx: `chmod 755 /home/ubuntu`, then
   `sudo cp deploy/nginx.conf /etc/nginx/sites-available/lep`,
   `sudo ln -sf /etc/nginx/sites-available/lep /etc/nginx/sites-enabled/lep`,
   `sudo rm -f /etc/nginx/sites-enabled/default`, `sudo nginx -t && sudo systemctl reload nginx`
8. API: `pm2 start deploy/ecosystem.config.js && pm2 save`, then `pm2 startup` and run the command it prints
9. Moderator account: register in the browser, then from `backend/` run `node scripts/makeModerator.js <email>`
10. Check: `curl -i http://localhost/api/partners` returns 401 (API up, login required);
    `http://<public-ip>/` loads the login page from My IP

Atlas accepts connections from any IP, because the server gets a new IP every time it restarts.
The database login in `backend/.env` still protects it.

## After the instance stops (the midnight stop)

1. Start the instance in the console; note the new public IP
2. nginx and pm2 start on boot; confirm with `pm2 status` and step 10 above

The front end calls `/api` on whatever address the page came from, so a new IP doesn't need a rebuild.

## Releasing a change

`git pull && npm install --prefix backend && npm run build --prefix frontend && pm2 restart lep-api`
