FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the server source code
COPY . .

# Expose port (default is 3000 but we'll use ENV PORT)
EXPOSE 3000

# Start the Node.js server
CMD ["npm", "run", "start"]
