# Docker start system

dev:

todo

prod:

- `docker-compose up --build`

# FE dev

make sure you have node installed

- go to /nextjs-app

- `npm i`
- `npm run dev`

# Scripts

make sure you have python installed

- go to /python-scripts
- `pip install -r requirements.txt`
- deps check: `pip list`
- if first time run: `discord_db.py`
- `python3 run_all.py`
- or `python run_all.py`

# Deploying docs

ssl sertificate hack:
after generating pulling on server run:

- `chmod 600 ./letsencrypt/acme.json`
  from project root.

other docker commands

delete all:

- `docker-compose down -v`

use prune to free up memory.

- `docker system prune -a --volumes`

db is being copied from local if exist btw.

# discord-bot

DiscordBot for hosting a dota 2 league

# How to setup discord bot

Step 1: Create a Discord Bot Account
Go to the Discord Developer Portal:
🔗 Discord Developer Portal

Click "New Application"

Give your bot a name and click Create.
Navigate to "Bot" Tab

Click on "Bot" on the left sidebar.
Click "Add Bot" and confirm.
Copy the Bot Token

Click "Reset Token" → Copy the token.
(This token is required for your bot to function.)
Step 2: Invite the Bot to Your Server
Go to "OAuth2" → "URL Generator"
Select "bot" under Scopes
Select Permissions (Example: Administrator, or just Send Messages, Manage Messages, Read Messages)
Copy the Generated URL and Open it in Your Browser
Select Your Server and Click "Authorize"
Your bot should now appear in the server (offline for now).

- ignore if you dont have website
  update your oauth2 urls.
  add redirect urls in oauth2:
  https://radekomsa.site/api/auth/callback/discord/callback/discord
  https://radekomsa.site/api/auth/callback/discord
- end of ignore

go to bot tab:
store secret key (TOKEN)

enable this also in bot tab:

Enable these: ✅ Presence Intent
✅ Server Members Intent
✅ Message Content Intent

# How to get channel ids

How to Get the Correct Discord Channel IDs?
You need to enable Developer Mode in Discord to get the actual channel IDs.

Step 1: Enable Developer Mode in Discord
Open Discord.
Go to User Settings → Advanced.
Toggle Developer Mode to ON.
Step 2: Get Channel IDs
Right-click on the channel (e.g., leaderboard, admin, default, etc.).
Click "Copy ID".
Paste the ID into your .env file.

# Initialize your DB

`python3 discord_db.py`

# Create role on dc

Create role to dc, assign yourself to that role and set rolename in league_settings.yaml

# DISCORD OAUTH SETTINGS

You can find the values for:

AUTH_SECRET
AUTH_DISCORD_ID
AUTH_DISCORD_SECRET

1. Generating AUTH_SECRET
   Run the following command in your terminal inside the project directory:

npx auth secret
This will generate a secret key, which you should add to your .env.local file like this:

AUTH_SECRET=your_generated_secret_here 2. Finding AUTH_DISCORD_ID and AUTH_DISCORD_SECRET
These come from your Discord Developer Portal:

Go to Discord Developer Portal.
Log in and select your application (or create one if you haven't).
In the "OAuth2" section, copy:
Client ID → This is your AUTH_DISCORD_ID
Client Secret → This is your AUTH_DISCORD_SECRET
Paste them into your .env.local file:
AUTH_DISCORD_ID=your_discord_client_id_here
AUTH_DISCORD_SECRET=your_discord_client_secret_here 3. Setting Up the .env.local File
Now your .env.local file should look like this:

# Certificate for (HTTPS) commands

mkdir -p letsencrypt
chmod 600 letsencrypt/acme.json
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
