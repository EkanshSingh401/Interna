# Use the official lightweight Node.js image.
FROM node:18-slim

# 1. Install LaTeX dependencies
# We combine update, install, and clean in one step to keep the image small
RUN apt-get update && apt-get install -y \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    && rm -rf /var/lib/apt/lists/*

# 2. Create and change to the app directory.
WORKDIR /usr/src/app

# 3. Copy application dependency manifests to the container image.
COPY package*.json ./

# 4. Install production dependencies.
RUN npm install --only=production

# 5. Copy local code to the container image.
COPY . .

# 6. Run the web service on container startup.
CMD [ "npm", "start" ]