# 🎮 DOTA LEAGUE HOSTING PLATFORM

Welcome to the **Dota 2 League Hosting Platform**, a side project with **100+ active users**!

### 🧩 How It Works

- Players **join a queue** on Discord.
- Once **10 players** are in queue, a **Steam bot**:
  - Creates a lobby
  - Invites all players
- The **Discord bot** notifies players.
- When all players join:
  - The lobby starts **automatically**
  - The match is tracked and **scored**
- MMR is updated live.
- In **Season 2**, enjoy:
  - 🧠 Full match history
  - 📊 Detailed stats per game

# 🌐 PRODUCTION LINKS

- 🏆 Dota League Hosting Platform: `https://www.dota-league-hosting.xyz/`
- 🥇 Season 1: `https://dota-league.vercel.app/`
- 🥈 Season 2: `https://radekomsa.site/`

---

# 🛠️ DEV DOCUMENTATION

## 💻 Frontend Dev (Next.js)

Make sure Node.js is installed.

```bash
cd nextjs-app
npm install
npm run dev
```

## 🐍 Python Scripts Dev

Make sure Python is installed.

```bash
cd python-scripts
pip install -r requirements.txt       # Install dependencies
pip list                              # Check installed packages

# First time setup
python3 discord_db.py

# Run the scripts
python3 run_all.py dev
# Or if using 'python' directly
python run_all.py dev
```

---

# 🚀 DEPLOYMENT DOCS

## 🐳 Docker Start System

```bash
docker-compose up --build
```

### 🧪 Environment Setup

Create environment files:

```bash
nano .env.python
nano .env.nextjs
```

Paste the contents, then:

- `Ctrl+O` → Save
- `Enter` → Confirm filename
- `Ctrl+X` → Exit nano

List files to verify:

```bash
ls -la
cat .env.nextjs
```

### 🔒 SSL Certificate Fix

After generating the SSL cert on the server:

```bash
chmod 600 ./letsencrypt/acme.json
```

Run from the project root.

### 🧹 Other Docker Commands

Delete all containers and volumes:

```bash
docker-compose down -v
```

Free up memory:

```bash
docker system prune -a --volumes
```

ℹ️ Note: DB is copied from local if it exists.

---

# 🤖 DISCORD BOT

DiscordBot for hosting a Dota 2 League.

## ⚙️ How to Set Up the Discord Bot

### Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → Give it a name → **Create**
3. Go to the **Bot** tab → Click **Add Bot** → Confirm
4. Click **Reset Token** → **Copy** the token

✅ Enable in Bot Tab:

- Presence Intent
- Server Members Intent
- Message Content Intent

---

### Step 2: Invite the Bot to Your Server

1. Go to **OAuth2 > URL Generator**
2. Select `bot` under Scopes
3. Add permissions (e.g., Administrator, Send/Manage Messages)
4. Copy the generated URL → Open in browser → Select server → Authorize

### 🔁 (Optional) Website Integration

If using a frontend:

Update **OAuth2 Redirect URLs** in the Discord Developer Portal:

```
https://radekomsa.site/api/auth/callback/discord/callback/discord
https://radekomsa.site/api/auth/callback/discord
```

---

## 🔑 Discord OAuth Settings

### 1. Generating `AUTH_SECRET`

```bash
npx auth secret
```

Add to `.env.local`:

```env
AUTH_SECRET=your_generated_secret
```

### 2. Getting Discord Client Info

From the [Discord Developer Portal](https://discord.com/developers/applications):

```env
AUTH_DISCORD_ID=your_discord_client_id
AUTH_DISCORD_SECRET=your_discord_client_secret
```

---

# 📢 CHANNEL SETUP

## How to Get Discord Channel IDs

1. Enable Developer Mode in Discord:
   - User Settings → Advanced → Enable Developer Mode
2. Right-click a channel → Copy ID → Paste into `.env`

---

## 🗃️ Database Setup

Initialize:

```bash
python3 discord_db.py
```

---

## 🎭 Discord Role Management

1. Create a role on Discord
2. Assign it to yourself
3. Set `rolename` in `league_settings.yaml`

---

# 📦 .env File Permissions for HTTPS

```bash
mkdir -p letsencrypt
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
```

---

# 👑 Add Admin to League

Paste full Steam profile URL into:

```
https://www.dota2.com/league/17791/admins
```

---

# 🧾 Read DB on Ubuntu

```bash
sqlite3 league.db
sqlite> .tables
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT * FROM MatchHistory;
sqlite> .exit
```

---

# 📜 Read Python Logs

```bash
docker-compose logs -f python
```
