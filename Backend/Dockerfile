FROM node:18.16.0-alpine

# Create App Directory
WORKDIR /app

# Install Dependencies
COPY package.json .

RUN npm install --silent

# Copy app source code
COPY . .

# Exports
EXPOSE 5000

CMD ["npm","start"]