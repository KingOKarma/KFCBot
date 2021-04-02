# Import prebuilt node image
FROM node:12

# Set Root dictionary for the application
WORKDIR /usr/src/app

# Copy over package file
COPY package*.json yarn*.lock ./


# Install dependencies
RUN npm i -g typescript
RUN npm i

# Copy rest of files to the image
COPY . .

VOLUME [ "/kfcboy:/usr/src/app/settings.sqlite3" ]

# Run the bot
CMD ["yarn", "start"]