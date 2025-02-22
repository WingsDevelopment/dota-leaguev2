# Scripts how to start

make sure you have python installed

- go to /python-scripts
- `pip install -r requirements.txt`
- deps check: `pip list`
- if first time run: `discord_db.py`
- `python3 run_all.py`
- or `python run_all.py`

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
