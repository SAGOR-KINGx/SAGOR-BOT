FROM node:20-slim

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Run npm install (the preinstall script should now find python3)
RUN npm install --omit=dev && npm cache clean --force

COPY . .

ENV PORT=10000
EXPOSE 10000

CMD ["node", "index.js"]
