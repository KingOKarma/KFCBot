# Import prebuilt node image
FROM node:16

# Set Root dictionary for the application
WORKDIR /usr/src/app

# Copy over package file
COPY package.json  tsconfig.json ./


# Install dependencies
RUN npm i

# Copy rest of files to the image
COPY . .

# Run the bot
CMD ["yarn", "start"]