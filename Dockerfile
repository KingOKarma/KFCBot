# Import prebuilt node image
FROM node:12

# Set Root dictionary for the application
WORKDIR /usr/src/app

# Copy over package file
COPY package*.json  tsconfig.json ./


# Install dependencies
RUN npm i

# Copy rest of files to the image
COPY . .

# Builds the bots files
RUN yarn build

# Tells docker to save this file
VOLUME [ "/kfcboy:/usr/src/app/settings.sqlite3" ]

# Run the bot
CMD ["yarn", "launch"]