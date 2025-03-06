# nextjs-app/Dockerfile
FROM node:18-slim 

WORKDIR /app

# Install build tools if needed (for native modules, etc.)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN rm -rf .next && npm run build

EXPOSE 3000
CMD ["npm", "start"]
