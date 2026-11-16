# Installation Manual

> [!IMPORTANT]
> **Linux Server Only:** This Installation Manual covers installation and deployment exclusively on a **Linux server** (Ubuntu 22.04 LTS / 24.04 LTS or Debian 12 64-bit recommended). **Support is not offered for Windows, macOS, BSD, or other operating systems.** Production hosting relies on Linux-specific kernel socket tuning (`sysctl`), POSIX file descriptor resource limits (`LimitNOFILE`), systemd service supervision, and Linux Nginx epoll event architectures.

This manual provides complete, step-by-step instructions for provisioning, configuring, tuning, and deploying the SD3 Alumni platform on a fresh Linux virtual private server (VPS) or dedicated host.

---

## 🏗️ 1. Architecture Overview

In a production Linux environment, the platform operates as a unified, high-performance stack:

```
[ Public HTTPS / Internet ]
            │
            ▼ (Ports 80/443)
┌─────────────────────────────────────────────────────────────┐
│ Nginx Reverse Proxy (1.20+)                                 │
│  - HTTP/2 Multiplexing & Let's Encrypt TLS Termination      │
│  - worker_connections 4096 | worker_rlimit_nofile 65535     │
│  - Gzip Level 5 Compression (JSON / CSS / JS / SVG)         │
│  - Upstream Persistent Keep-Alive Pool (keepalive 256)      │
│                                                             │
│  ┌───────────────────────┐       ┌──────────────────────┐   │
│  │ Direct Static Serving │       │ Upstream Proxy       │   │
│  │ /images/ & /uploads/  │       │ /api/* & SPA catchall│   │
│  │ (Disk cache: 7 days)  │       │                      │   │
│  └───────────┬───────────┘       └──────────┬───────────┘   │
└──────────────┼──────────────────────────────┼───────────────┘
               │                              │ (127.0.0.1:3000)
               ▼                              ▼
  /home/alumni/sd3-alumni/         ┌───────────────────────────┐
  images/albums/default/           │ Express Server (Node.js)  │
                                   │  - PM2 daemon supervision │
                                   │  - Serves API & SPA dist/ │
                                   │  - Integrated Classifier  │
                                   └──────────┬────────────────┘
                                              │
                                              ▼
                                   ┌───────────────────────────┐
                                   │ SQLite via Prisma Client  │
                                   │  (PRAGMA journal_mode =   │
                                   │   DELETE;)                │
                                   └───────────────────────────┘
```

### Key Architectural Characteristics

1. **Unified Express Backend**: The backend application ([`api/index.js`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/api/index.js)) serves all `/api/*` REST endpoints on internal port `3000`. In production, it also serves the pre-compiled React single-page application (`dist/` directory) on the root path `/` with catch-all routing to `index.html`.
2. **Zero-CORS Single-Origin Architecture**: Because the API and frontend assets are reverse-proxied behind the exact same domain name and port via Nginx, cross-origin preflight checks (`OPTIONS`) and CORS overhead are completely avoided.
3. **High-Performance Static Media Offloading**: Rather than piping static asset requests through the single-threaded Node.js event loop, Nginx directly serves `/images/` and `/uploads/` directly from the server filesystem with a 7-day browser cache (`Cache-Control: public, max-age=604800`).
4. **Hero Simplification**:
   - The landing page's Main Hero carousel ([`src/app/components/user/CuratedHero.tsx`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/src/app/components/user/CuratedHero.tsx) and [`src/components/hero-3.tsx`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/src/components/hero-3.tsx)) has been architecturally streamlined.
   - The legacy implementation relied on dynamic database queries against a `HeroGallery` table, complex album scraping, runtime sampling of up to 30 items via `/api/hero/images`, and blacklist checking.
   - The Hero now uses a curated set of high-resolution, static default images located in `images/albums/default/` (12 curated photos: `civil.jpg`, `deans.jpg`, `ece.jpg`, `electrical.jpg`, `enrollment.jpg`, `homecoming.jpg`, `masters.jpg`, `mayor.jpg`, `otog.jpg`, `research.jpg`, `research2.jpg`, and `specialcourse.jpg`) and a fixed card target count (6 cards per row).
   - **Deployment Impact**: You do **not** need to scrape external media or seed hero gallery records in the database during installation. Simply ensure the repository's `images/` directory is cloned and readable by Nginx.
5. **Integrated Background Content Classifier**:
   - The Cloudflare Clef content moderation and user auto-registration loop is directly integrated into Express ([`api/index.js`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/api/index.js)).
   - There is no need for secondary daemon wrappers (e.g. `tmux` sessions). It is driven entirely by the `CLASSIFIER_INTERVAL_MINUTES` environment variable.
6. **SQLite Storage Engine**:
   - The database uses SQLite with Prisma ORM (`@prisma/adapter-better-sqlite3`).
   - The database mode is deliberately locked to `PRAGMA journal_mode = DELETE;` with a 10-second busy timeout (`PRAGMA busy_timeout = 10000;`).

---

## 🛠️ 2. Server Prerequisites & User Setup

### 2.1 System Requirements (Linux Only)

- **Operating System**: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, or Debian 12 (x86_64 or aarch64)
- **CPU / RAM**: Minimum 1 vCPU, 2 GB RAM (2 vCPU, 4 GB RAM recommended for smooth frontend builds)
- **Disk**: Minimum 20 GB SSD storage
- **Packages**:
  - **Node.js**: v18.x or v20.x LTS (Node.js 20+ recommended)
  - **pnpm**: v9.x or v10.x
  - **PM2**: Global Node.js process manager
  - **Nginx**: v1.20+ with HTTP/2 support
  - **Certbot**: `certbot` and `python3-certbot-nginx`
  - **Build Utilities**: `build-essential`, `git`, `curl`
  - *(Note: Python is **not** required on the production host. Administrative Python scripts are strictly intended for remote execution outside the production environment).*

### 2.2 Install Base System Packages

Run the following commands as `root` (or using `sudo`):

```bash
# Update package lists and install essential system tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Enable and configure pnpm and PM2 globally
sudo npm install -g pnpm pm2
```

Verify your installations:
```bash
node -v   # v20.x.x
pnpm -v   # 9.x.x or 10.x.x
pm2 -v    # 5.x.x or 6.x.x
nginx -v  # nginx version 1.20+
```

### 2.3 Create a Dedicated Non-Root User

> [!WARNING]
> **Never run Node.js, PM2, or your application as `root`.** Running application runtimes as root grants potential dependency exploits complete administrative ownership of your server. Always execute the application under an isolated, unprivileged user.

```bash
# 1. Create a dedicated system user 'alumni' with a home directory and bash shell
sudo adduser --disabled-password --gecos "" alumni

# 2. (Optional) Grant sudo privileges for maintenance tasks
sudo usermod -aG sudo alumni

# 3. Add the Nginx user (www-data) to the 'alumni' group so Nginx can read static images
sudo usermod -aG alumni www-data

# 4. Switch to the new 'alumni' user
su - alumni
```

### 2.4 Clone Repository & Permissions

While logged in as `alumni`:

```bash
# Clone the repository into the user's home folder
git clone <your-repository-url> /home/alumni/sd3-alumni
cd /home/alumni/sd3-alumni

# Ensure permissions allow Nginx (www-data) to traverse the directory and serve static files
chmod 750 /home/alumni
chmod -R 755 /home/alumni/sd3-alumni/images
chmod -R 755 /home/alumni/sd3-alumni/uploads
```

---

## ⚡ 3. Linux OS Limits & Kernel Socket Tuning

Under heavy production traffic or concurrent user bursts, default Linux configurations trigger socket starvation (`NoHttpResponseException`), connection resets, and file descriptor exhaustion. Apply the following kernel and OS-level limits.

### 3.1 Kernel TCP Stack Tuning (`/etc/sysctl.d/99-alumni.conf`)

Create or update `/etc/sysctl.d/99-alumni.conf` as `root` (or with `sudo`):

```bash
sudo tee /etc/sysctl.d/99-alumni.conf << 'EOF'
# Increase the maximum socket listen backlog for high concurrency
net.core.somaxconn = 4096

# Expand TCP SYN backlog queue to absorb connection bursts without dropping packets
net.ipv4.tcp_max_syn_backlog = 4096

# Expand ephemeral port range to prevent local port exhaustion on reverse proxy
net.ipv4.ip_local_port_range = 1024 65535

# Reclaim TIME_WAIT sockets safely for outgoing connections
net.ipv4.tcp_tw_reuse = 1
EOF

# Apply kernel parameters immediately without rebooting
sudo sysctl --system
```

### 3.2 System File Descriptor Limits (`/etc/security/limits.d/99-alumni.conf`)

By default, Linux restricts user processes to 1,024 open file descriptors. Nginx and Node.js require a higher limit to handle concurrent connections, sockets, and static files.

Create `/etc/security/limits.d/99-alumni.conf`:

```bash
sudo tee /etc/security/limits.d/99-alumni.conf << 'EOF'
*          soft    nofile    65535
*          hard    nofile    65535
root       soft    nofile    65535
root       hard    nofile    65535
alumni     soft    nofile    65535
alumni     hard    nofile    65535
www-data   soft    nofile    65535
www-data   hard    nofile    65535
EOF
```

### 3.3 Systemd Service Limits

Systemd does not inherit `/etc/security/limits.conf` by default. Ensure systemd services for Nginx and PM2 receive full file descriptor quotas:

1. **For Nginx**:
   Create a systemd drop-in override for Nginx:
   ```bash
   sudo mkdir -p /etc/systemd/system/nginx.service.d
   sudo tee /etc/systemd/system/nginx.service.d/limits.conf << 'EOF'
   [Service]
   LimitNOFILE=65535
   EOF
   sudo systemctl daemon-reload
   sudo systemctl restart nginx
   ```

2. **For PM2 / Node.js**:
   When generating the PM2 systemd service later in [Section 6](#-6-process-supervision-pm2--systemd), verify that `LimitNOFILE=65535` is present in `/etc/systemd/system/pm2-alumni.service`.

---

## 🔐 4. Environment Variables (`.env`)

In `/home/alumni/sd3-alumni/`, create your production `.env` configuration file:

```bash
cd /home/alumni/sd3-alumni
nano .env
```

Populate `.env` with your production values:

```env
# ==============================================================================
# SERVER & APPLICATION CONFIGURATION
# ==============================================================================
NODE_ENV="production"
PORT=3000
API_PORT=3000

# SQLite Database Location (Absolute path or relative to project root)
DATABASE_URL="file:./dev.db"

# Mandatory Secret Key for Signing JSON Web Tokens (Min 32 characters recommended)
JWT_SECRET="generate_a_long_cryptographically_secure_random_string_here"

# In-Memory Cache TTLs (Optional, in seconds)
FEED_CACHE_TTL_SECONDS=60
LOOKUP_CACHE_TTL_SECONDS=300

# ==============================================================================
# CONTENT CLASSIFIER & AUTO-REGISTRATION (MERGED RUNTIME)
# ==============================================================================
# Interval in minutes for background content moderation and auto-approval.
# Set strictly to an integer: 0 disables classification; >0 activates the scheduler.
CLASSIFIER_INTERVAL_MINUTES=15

# Cloudflare AI Clef credentials (REQUIRED if CLASSIFIER_INTERVAL_MINUTES > 0)
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_API_TOKEN="your_cloudflare_api_token"

# ==============================================================================
# PAYMENT GATEWAY (PAYMONGO)
# ==============================================================================
PAYMONGO_PUBLIC_KEY="pk_live_..."
PAYMONGO_SECRET_KEY="sk_live_..."
PAYMONGO_WEBHOOK="whsk_..."

# ==============================================================================
# OPTIONAL / UTILITY
# ==============================================================================
PROXY_PORT=8085
```

> [!CAUTION]
> - `CLASSIFIER_INTERVAL_MINUTES` is strictly validated at application startup. If this variable is omitted or not a valid integer, the Express application will refuse to start and immediately abort.
> - If `CLASSIFIER_INTERVAL_MINUTES` is greater than `0`, `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` must be populated. If you do not wish to use Cloudflare AI classification, set `CLASSIFIER_INTERVAL_MINUTES=0`.
> - The database uses `PRAGMA journal_mode = DELETE;`. Do not alter the SQLite pragma settings in code or migrations.

---

## 📦 5. Installation & Build Workflow

As the non-root user (`alumni`), execute the deployment sequence from `/home/alumni/sd3-alumni`:

### Step 1: Install Dependencies
```bash
cd /home/alumni/sd3-alumni
pnpm install --frozen-lockfile
```
*(If `--frozen-lockfile` produces an integrity error due to local workspace additions, run `pnpm install`).*

### Step 2: Database Initialization & Mandatory Seeding

> [!IMPORTANT]
> - **Schema Synchronization:** This repository uses `prisma db push` (there is no `prisma/migrations/` directory). Always synchronize the database schema using `pnpm prisma:push && pnpm prisma:generate`. Do not run `pnpm prisma:deploy` or `pnpm prisma:dev`.
> - **Mandatory Database Seeding:** Running `pnpm prisma:seed` is **strictly mandatory, not optional**. The application requires baseline reference records and lookup statuses (`connectionStatuses`, `contentStatuses`, `eventStatuses`, `userStatuses`, `donationStatuses`, `eventCategories`, `bulletinCategories`, `profileStatuses`, `degrees`, `achievements`, and system `notificationType`) to be pre-populated in SQLite. Without this initial seed, critical user workflows such as user registration, event creation, bulletin posting, and status moderation will immediately fail due to missing foreign key relations.

1. **Synchronize Schema with SQLite:**
   ```bash
   pnpm prisma:push && pnpm prisma:generate
   ```

2. **Execute Mandatory Baseline Seed:**
   ```bash
   pnpm prisma:seed
   ```
   *Mechanism:* The seed runner reads [`db.json`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/db.json). The git repository already tracks a clean, empty baseline `db.json` containing all required system statuses and achievement definitions with empty entity collections (`users: []`, `bulletins: []`, `events: []`, etc.). Seeding with this tracked file provisions a clean production database without generating mock users or dummy content.

> [!NOTE]
> **Mock Data Generation (Optional & Remote Only):**
> If you are initializing a staging, demo, or testing server, you may optionally populate `db.json` with multi-tier mock records using [`script/generate-db.py`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/script/generate-db.py).
> - Generating mock data via the script is **strictly optional**.
> - The deployment environment ideally should not run Python scripts; administrators should execute `script/generate-db.py` **remotely** in a virtual environment (see [Section 10](#-10-optional-remote-python-administration-environment-setup)).
> - While `script/generate-db.py --empty` can regenerate an empty database JSON, the git repository already tracks an empty `db.json` out of the box, making script execution unnecessary for standard clean production deployments. Only the seed command (`pnpm prisma:seed`) is mandatory.

### Step 3: Compile Frontend Single-Page Application
Compile the React frontend into production-optimized assets inside the `dist/` directory:
```bash
pnpm build
```
This builds TypeScript sources and bundles client code via Vite into `dist/`.

### Step 4: Verify Static Asset Presence (Hero & Uploads)
Verify that the static hero assets exist and are populated:
```bash
ls -la images/albums/default/
```
You should see the 12 default static images (`civil.jpg`, `otog.jpg`, `masters.jpg`, etc.). Ensure that the `uploads/` directory exists for user attachments:
```bash
mkdir -p uploads
chmod 755 uploads
```

---

## 🚀 6. Process Supervision (PM2 & Systemd)

The application is managed in production using **PM2**, which automatically keeps the Express server alive, captures logs, and integrates with the Linux **systemd** service manager.

### 6.1 Start the Application

As the `alumni` user:
```bash
cd /home/alumni/sd3-alumni
pnpm start
```

This runs:
```bash
cross-env NODE_ENV=production pm2 start npm --name sd3-alumni -- run tsx-server
```

### 6.2 Common PM2 Commands

- **Check Process Status:**
  ```bash
  pm2 status
  ```
- **Stream Live Logs:**
  ```bash
  pm2 logs sd3-alumni
  ```
- **Restart the Server:**
  ```bash
  pm2 restart sd3-alumni
  ```
- **Stop the Server:**
  ```bash
  pm2 stop sd3-alumni
  ```

### 6.3 Configure Auto-Restart on Linux Boot (Systemd)

To guarantee that the application automatically starts when the Linux server reboots:

1. **Save Active PM2 State:**
   ```bash
   pm2 save
   ```
   *This dumps the running `sd3-alumni` process into `/home/alumni/.pm2/dump.pm2`.*

2. **Generate and Install the Systemd Service:**
   ```bash
   pm2 startup systemd -u alumni --hp /home/alumni
   ```
   PM2 will output a specific `sudo` command. Copy and run that command as prompted, for example:
   ```bash
   sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u alumni --hp /home/alumni
   ```

3. **Verify File Descriptor Limits in PM2 Systemd Unit:**
   Inspect `/etc/systemd/system/pm2-alumni.service` and ensure `LimitNOFILE=65535` is present under `[Service]`:
   ```bash
   sudo tee -a /etc/systemd/system/pm2-alumni.service << 'EOF'

   [Service]
   LimitNOFILE=65535
   EOF
   sudo systemctl daemon-reload
   ```

---

## 🌐 7. Reverse Proxy Configuration (Nginx)

The repository directly tracks the exact, pre-tuned production configuration files under [`nginx/`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/nginx/):
- [`nginx/nginx.conf`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/nginx/nginx.conf) (Global worker engine & compression)
- [`nginx/alumni.conf`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/nginx/alumni.conf) (Virtual host, upstream keepalive pool, static caching, and TLS)

These configurations incorporate all high-concurrency stress test findings (hardened for sustained concurrency up to 1,000 Virtual Users).

### 7.1 Deploying the Tracked Nginx Configurations

Depending on the workstation and workflow used to deploy and administer the server, install the tracked configuration files using one of the following methods:

#### Method A: Direct Local Copy (When Working Directly on the Linux Server)
If you have cloned the repository directly onto the target server:
```bash
sudo cp /home/alumni/sd3-alumni/nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp /home/alumni/sd3-alumni/nginx/alumni.conf /etc/nginx/sites-available/alumni.conf
```

#### Method B: Remote Deployment via `rsync` (From an Administrator Workstation)
If deploying configurations from an external workstation with `rsync`:
```bash
# Transfer configuration files to staging location
rsync -avz ./nginx/nginx.conf <admin-user>@<server-ip>:/tmp/nginx.conf
rsync -avz ./nginx/alumni.conf <admin-user>@<server-ip>:/tmp/alumni.conf

# Move into system directories with sudo
ssh <admin-user>@<server-ip> "sudo mv /tmp/nginx.conf /etc/nginx/nginx.conf && sudo mv /tmp/alumni.conf /etc/nginx/sites-available/alumni.conf"
```

#### Method C: Remote Deployment via `scp` and `ssh` (From an Administrator Workstation)
If `rsync` is unavailable, use standard `scp`:
```bash
# Secure copy configurations to remote server
scp ./nginx/nginx.conf <admin-user>@<server-ip>:/tmp/nginx.conf
scp ./nginx/alumni.conf <admin-user>@<server-ip>:/tmp/alumni.conf

# Move into place and apply correct root ownership
ssh <admin-user>@<server-ip> "sudo mv /tmp/nginx.conf /etc/nginx/nginx.conf && sudo mv /tmp/alumni.conf /etc/nginx/sites-available/alumni.conf && sudo chown root:root /etc/nginx/nginx.conf /etc/nginx/sites-available/alumni.conf"
```

---

### 7.2 Global Configuration Reference (`/etc/nginx/nginx.conf`)

Replace or update `/etc/nginx/nginx.conf` with the optimized configuration tracked in [`nginx/nginx.conf`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/nginx/nginx.conf):

```nginx
user www-data;
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 4096;
    multi_accept on;
}

http {
    ##
    # Basic Settings
    ##
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    server_tokens build;
    keepalive_timeout 65;
    keepalive_requests 10000;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ##
    # SSL Settings
    ##
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    ##
    # Logging Settings
    ##
    access_log /var/log/nginx/access.log;

    ##
    # Gzip Settings (80–85% payload compression on API and static responses)
    ##
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

Copy the repository configuration into place:
```bash
sudo cp /home/alumni/sd3-alumni/nginx/nginx.conf /etc/nginx/nginx.conf
```

### 7.3 Site Configuration Reference (`/etc/nginx/sites-available/alumni.conf`)

Configure the virtual host tracked in [`nginx/alumni.conf`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/nginx/alumni.conf). Replace `najealp.top` with your actual domain name:

```nginx
upstream alumni_api {
    server 127.0.0.1:3000;
    keepalive 256;
}

server {
    server_name najealp.top www.najealp.top;

    # 1. Direct Static Asset Serving: /images/ (Hero & Platform Images)
    location ^~ /images/ {
        root /home/alumni/sd3-alumni;
        try_files $uri @alumni_backend;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # 2. Direct Static Asset Serving: /uploads/ (User Uploads)
    location ^~ /uploads/ {
        root /home/alumni/sd3-alumni;
        try_files $uri @alumni_backend;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # 3. Fallback Route to Backend
    location @alumni_backend {
        proxy_pass http://alumni_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 4. Primary Route: SPA Frontend & Express API Proxying
    location / {
        proxy_pass http://alumni_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    http2 on;
    ssl_certificate /etc/letsencrypt/live/najealp.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/najealp.top/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.najealp.top) {
        return 301 https://$host$request_uri;
    }

    if ($host = najealp.top) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name najealp.top www.najealp.top;
    return 404;
}
```

#### Why These Nginx Settings Matter
- **`upstream alumni_api` + `keepalive 256;`**: Maintains an open pool of persistent connections between Nginx and Express. Eliminates connection tear-downs, port churn, and `TIME_WAIT` socket exhaustion.
- **`proxy_set_header Connection ""`**: Clears hop-by-hop connection headers so HTTP/1.1 keep-alive functions reliably between Nginx and Node.js.
- **Direct `/images/` & `/uploads/` Block**: Completely bypasses the single-threaded Node.js event loop for the static hero carousel and media requests, serving assets instantly from the Linux kernel page cache.
- **`http2 on;`**: Multiplexes requests over a single TCP connection, drastically accelerating parallel client-side rendering.

### 7.4 Enable Site & Acquire SSL Certificate

1. **Verify that the configuration file exists and create the enabled symlink:**
   ```bash
   sudo ln -sf /etc/nginx/sites-available/alumni.conf /etc/nginx/sites-enabled/alumni.conf
   ```

2. **Obtain Let's Encrypt TLS Certificate via Certbot:**
   *(If deploying for the first time, point your domain's DNS A/AAAA records to your VPS IP address first).*
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Test Syntax and Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 🩺 8. Verification & Health Checks

Once installation is complete, verify that all layers are performing correctly on the server.

### 8.1 HTTP/2 & Web Verification
```bash
# Verify HTTPS response and HTTP/2 protocol negotiation
curl -I https://yourdomain.com/

# Verify direct Nginx static serving and 7-day Cache-Control on Hero image
curl -I https://yourdomain.com/images/albums/default/otog.jpg
```
*Expected output for the Hero image includes: `HTTP/2 200`, `cache-control: public, max-age=604800`, and `expires: ...`.*

### 8.2 API Endpoint Health Check
```bash
curl -s https://yourdomain.com/api/degrees | head -n 20
```
*Expected output: A JSON array of degree records.*

### 8.3 Verify Linux Process Resource Limits
Verify that your operating system limits are applied to the running daemons:

```bash
# Check Nginx master and worker open file limit (should show 65535)
cat /proc/$(pgrep -o nginx)/limits | grep "Max open files"

# Check PM2 / Node.js open file limit (should show 65535)
cat /proc/$(pgrep -f "pm2" | head -n 1)/limits | grep "Max open files"

# Check active system socket backlog parameter
sysctl net.core.somaxconn
```

---

## 📈 9. Maintenance & PM2+ Monitoring

- **PM2+ Web Dashboard**: Link your production node to the PM2+ Web Dashboard for real-time memory usage, CPU load, and exception alerts:
  ```bash
  pm2 link <secret_key> <public_key>
  ```
  Visit the [PM2+ Dashboard](https://app.pm2.io/) to monitor remote telemetry.
- **Log Rotation**: PM2 automatically aggregates logs into `/home/alumni/.pm2/logs/`. To prevent disk bloat, install the PM2 logrotate module:
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 50M
  pm2 set pm2-logrotate:retain 10
  ```
- **Database Backups**: Because SQLite stores all data in a single file (`dev.db`), automated backup can be performed cleanly using the SQLite backup API or standard shell archiving:
  ```bash
  sqlite3 /home/alumni/sd3-alumni/dev.db ".backup '/home/alumni/backups/dev_$(date +%F).db'"
  ```

---

## 🐍 10. (Optional) Remote Python Administration Environment Setup

> [!IMPORTANT]
> **No Python on Production Server:** The production/deployment Linux environment should ideally **not** execute any Python scripts. All core platform runtime components (Express, Vite build, Prisma ORM, PM2 daemon, and Nginx) execute purely under Node.js and Linux system daemons.
>
> If the administrator needs to execute database generation, diagnostic utilities, maintenance tasks, or testing scripts, they must be executed **remotely** from an administrator workstation or a dedicated non-production testing environment.

Administrators are **highly advised to setup an isolated Python virtual environment** on their remote workstation prior to running any scripts. A separate agent is currently cleaning up and removing unused scripts across the repository, but the dependency set below provides the complete environment required for active tools (e.g. [`script/generate-db.py`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/script/generate-db.py)).

### 10.1 Remote Virtual Environment Setup

On your remote administration machine (Linux, macOS, or Windows):

```bash
# 1. Create a dedicated virtual environment
python -m venv .venv

# 2. Activate the virtual environment
# On Linux / macOS:
source .venv/bin/activate
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Windows (CMD):
.\.venv\Scripts\activate.bat
```

### 10.2 Installed Python Package Dependencies

Install the current list of installed pip packages used across repository administrative and testing scripts:

```bash
pip install --upgrade pip
pip install \
    bidict==0.24.1 \
    blinker==1.9.0 \
    brotli==1.2.1 \
    certifi==2026.5.20 \
    cffi==2.1.1 \
    charset-normalizer==3.4.7 \
    click==8.5.1 \
    colorama==0.4.6 \
    ConfigArgParse==1.9.0 \
    et_xmlfile==2.0.0 \
    Flask==3.1.3 \
    flask-cors==6.0.5 \
    Flask-Login==0.6.3 \
    gevent==26.9.0 \
    geventhttpclient==2.6.1 \
    greenlet==3.5.1 \
    h11==0.16.0 \
    idna==3.17 \
    iniconfig==2.3.1 \
    itsdangerous==2.2.0 \
    Jinja2==3.1.6 \
    locust==2.47.0 \
    lxml==6.1.1 \
    MarkupSafe==3.0.4 \
    msgpack==1.2.4 \
    nanoid==2.0.0 \
    openpyxl==3.1.5 \
    packaging==26.3 \
    playwright==1.60.0 \
    pluggy==1.7.0 \
    psutil==7.2.2 \
    pycparser==3.12 \
    pyee==13.0.1 \
    Pygments==2.21.0 \
    pypdf==7.1.0 \
    pytest==9.2.0 \
    python-docx==1.2.0 \
    python-engineio==4.15.1 \
    python-socketio==5.18.1 \
    pyzmq==27.3.0 \
    requests==2.34.2 \
    Send2Trash==2.1.0 \
    simple-websocket==1.1.0 \
    typing_extensions==4.15.0 \
    urllib3==2.7.0 \
    websocket-client==1.9.2 \
    Werkzeug==3.1.9 \
    wsproto==1.3.2 \
    zope.event==6.2 \
    zope.interface==8.7
```
*(Note: If configuring on a Windows workstation, `pywin32==312` is also included in the environment).*

### 10.3 Generating Mock Data or Clean Schemas with `generate-db.py`

Once dependencies are installed, you can execute [`script/generate-db.py`](file:///c:/Users/PATRICIOJOSENAJEAL/Desktop/bin/sd3-alumni/script/generate-db.py) remotely:

```bash
# Option 1: Generate rich mock data (users, auths, bulletins, events, RSVPs, donations)
python script/generate-db.py

# Option 2: Reset db.json to an empty baseline schema (identical to the tracked db.json in git)
python script/generate-db.py --empty
```

If you generated mock data remotely and wish to deploy it to the server:
```bash
# Copy the generated db.json to the server
scp db.json alumni@<server-ip>:/home/alumni/sd3-alumni/db.json

# Then SSH in to re-seed the SQLite database on the server
ssh alumni@<server-ip> "cd /home/alumni/sd3-alumni && pnpm prisma:seed"
```
