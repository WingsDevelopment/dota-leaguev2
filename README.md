# Docker start system

dev:

todo

prod:

- `STEAM_GUARD_CODE=xxxxx docker-compose up --build`

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
- `python3 run_all.py`
- or `python run_all.py`

# Deploying docs

ssl sertificate hack:
after generating pulling on server run:
`chmod 600 ./letsencrypt/acme.json`
from project root.

other docker commands

delete all:
`docker-compose down -v`

use prune to free up memory.

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

update your oauth2 urls.

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

first enable this:
Fixing the !ping Command Not Responding
Your bot is online, but it isn't responding to commands.
This is because message content intent is disabled by default.

Enable these: ✅ Presence Intent
✅ Server Members Intent
✅ Message Content Intent

And now when you send !ping bot should reply with pong!

# Initialize your DB

`python3 discord_db.py`

# Create role on dc

Create role to dc, assign yourself to that role and set rolename in league_settings.yaml
