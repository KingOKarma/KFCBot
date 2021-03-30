# Import prebuilt node image
FROM node:12

# Set Root dictionary for the application
WORKDIR /usr/src/app

# Copy over package file
COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install
RUN npm i -g typescript


# Copy rest of files to the image
COPY . .

VOLUME [ "/kfcboy:/usr/src/app/settings.sqlite3" ]

# Run the bot
CMD ["yarn", "start"]