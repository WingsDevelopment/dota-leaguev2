# python-scripts/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your scripts (including discord_db.py and run_all_py.py)
COPY . .

# (Optional) If you need bash and it’s not present, install it:
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

# The CMD is overridden by docker-compose "command"
CMD ["python", "script.py"]
