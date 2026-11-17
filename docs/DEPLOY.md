# Manual deployment to the university EC2 (LEP-14)

One instance runs everything: nginx serves the React build on port 80 and proxies `/api` to the
Express API on port 5001, which pm2 keeps running. MongoDB is Atlas. No CI/CD: every step below is
run by hand.

Instance: Ubuntu 26.04, t3.medium, 32 GB root volume. Security group: SSH (22) and HTTP (80) from
My IP only. Per the unit coordinator (3 Nov), no public URL or 0.0.0.0/0 rule is needed.

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

Atlas accepts connections from any IP, because the instance gets a new IP on every restart. The
database user and password in `backend/.env` protect it.

## After the instance stops (the midnight stop)

1. Start the instance in the console; note the new public IP
2. nginx and pm2 start on boot; confirm with `pm2 status` and step 10 above

The frontend calls `/api` relative to the page, so a new IP needs no rebuild.

## Releasing a change

`git pull && npm install --prefix backend && npm run build --prefix frontend && pm2 restart lep-api`
