# Deployment Workflow

This document outlines the standard deployment workflow for deploying the Alumni platform onto a VPS or production environment.

## 🏗️ 1. Architecture Overview

In production, the platform runs as a beautifully unified, single-port application:
- **Express Backend (Node.js)** serves all `/api/*` requests on Port 3000.
- **Express Backend** also serves the pre-compiled React frontend (`dist` folder) on the root path `/`.
- **Catch-all Routing:** Any non-API request automatically falls back to `index.html`, ensuring React Router handles all client-side navigation seamlessly.
- **Zero CORS:** Because the frontend and backend are served from the exact same domain and port, CORS and cross-origin preflight requests are entirely bypassed.

## 🚀 2. Initial Setup & Security

> [!IMPORTANT]
> **Never run Node.js or PM2 as `root`.** Running application servers as root grants any potential vulnerability or compromised dependency full administrative access to your operating system. Always run the application under a dedicated, non-privileged user.

### 2.1 Create a Dedicated Non-Root User
If you are logged into your VPS as `root`, create a non-root system user (e.g., `alumni`):
```bash
# Create user with a home directory
sudo adduser alumni

# (Optional) Grant sudo privileges for server administration
sudo usermod -aG sudo alumni

# Switch to the new user
su - alumni
```

### 2.2 Clone & Set Permissions
Clone the repository and ensure your non-root user owns the project directory:
```bash
# Clone the repository
git clone <your-repo-url> /home/alumni/sd3-alumni
cd /home/alumni/sd3-alumni

# Ensure proper ownership and permissions
sudo chown -R alumni:alumni /home/alumni/sd3-alumni
```

### 2.3 Prerequisites
Ensure **Node.js** (v18+), **pnpm**, and **PM2** are installed globally. (If installed via npm globally, verify non-root users have access to the binaries in their `$PATH`).


## 🔐 3. Environment Variables

In your production environment, create a `.env` file (you do NOT need a `.env.production` file for Vite, as the frontend is built to fall back to relative `/api/` paths gracefully).

Ensure the `.env` contains the required production secrets:
```env
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET="your_secret_key"
PAYMONGO_PUBLIC_KEY="pk_test_..."
PAYMONGO_SECRET_KEY="sk_test_..."
PAYMONGO_WEBHOOK="whsk_..."
PROXY_PORT=8085
NGROK_AUTHTOKEN="ngrok_auth_here"
CLOUDFLARE_API_TOKEN="cfat_..."
CLOUDFLARE_ACCOUNT_ID="cloudflare_id"
```

## 📦 4. Deployment Steps

Run these commands in order from the project root:

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Database Setup**
   Apply database migrations and generate the Prisma Client.
   ```bash
   pnpm prisma:deploy
   ```
   *(Optional)* If this is a fresh server and you want the dummy data, you can seed the database:
   ```bash
   pnpm prisma:seed
   ```

3. **Build the Frontend**
   Compile the React Application into the `dist` folder.
   ```bash
   pnpm build
   ```

4. **Start the Application with PM2**
   Since PM2 is integrated directly into the start script, you can simply run:
   ```bash
   pnpm start
   ```
   This will execute: `cross-env NODE_ENV=production pm2 start api/index.js --name sd3-alumni`. The Express server will spin up and run infinitely in the background!

### 🤖 5. (Optional) Start the AI Classifier

If you want to run the automated Cloudflare Clef content classifier in the background using `tmux`, execute:
```bash
pnpm run classifier:daemon
```
*Note: To view the live logs of the classifier, you can attach to the tmux session by running `tmux attach-session -t classifier`. To detach from the viewer without killing the script, press `Ctrl+B`, then release and press `D`.*

## 📊 6. Process Management (PM2)

Your `pnpm start` command daemonizes the app using PM2. You can manage and monitor your live application using these PM2 commands:

- **View Logs:** `pm2 logs sd3-alumni`
- **Check Status:** `pm2 status`
- **Restart App:** `pm2 restart sd3-alumni`
- **Stop App:** `pm2 stop sd3-alumni`

### Auto-Restart on Server Reboot (Systemd)

To make sure your app automatically restarts if the VPS is rebooted or encounters a power cycle, configure PM2 to integrate with the OS service manager (**systemd**):

1. **Save Current Process List**
   While logged in as your non-root user (`alumni`), save the running processes:
   ```bash
   pm2 save
   ```
   *This writes the active process list (`sd3-alumni`) to `/home/alumni/.pm2/dump.pm2`.*

2. **Generate and Install the Systemd Unit**
   Run the startup generator as `alumni`:
   ```bash
   pm2 startup
   ```
   PM2 will inspect your system and output a specific command containing your user path and systemd flags, for example:
   ```bash
   sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u alumni --hp /home/alumni
   ```
   Copy and run the exact command printed by PM2.

#### 🔍 What the Startup Script Actually Does:
- **Generates a Systemd Service File:** It creates `/etc/systemd/system/pm2-alumni.service`.
- **Configures Process Privileges:** Inside the service file, systemd sets `User=alumni` and `Environment="PM2_HOME=/home/alumni/.pm2"`.
- **Drops Root Privileges at Boot:** When the VPS powers on, `systemd` initializes PM2 under the `alumni` user rather than `root`.
- **Automatic Resurrection:** The unit runs `pm2 resurrect`, which reads `/home/alumni/.pm2/dump.pm2` and boots your `sd3-alumni` instance into the exact state it was in prior to shutdown.

---

## 🌐 6. Reverse Proxy (Nginx)

Because the Express application runs on port `3000` as a non-privileged user, use a reverse proxy like **Nginx** or **Caddy** to bind to public ports `80` (HTTP) and `443` (HTTPS) and route traffic to `localhost:3000`.

### Example Nginx Configuration (`/etc/nginx/sites-available/alumni.conf`):
### Nginx Configuration (`/etc/nginx/sites-available/alumni.conf`)

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;

    server_name najealp.top www.najealp.top;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```


Enable the configuration and secure with free SSL via Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/alumni.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d najealp.top -d www.najealp.top
```

---

## 📈 7. PM2+ Monitoring
You have successfully linked PM2 to the PM2+ Web Dashboard! You can view real-time metrics, memory usage, and remote logs for this server by visiting your [PM2+ Dashboard](https://app.pm2.io/).

