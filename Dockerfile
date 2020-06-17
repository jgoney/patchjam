FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Set env vars
ENV PORT=8080

ENV TYPEORM_CONNECTION=postgres
ENV TYPEORM_HOST=postgres
ENV TYPEORM_PORT=5432
ENV TYPEORM_USERNAME=postgres
ENV TYPEORM_PASSWORD=docker
ENV TYPEORM_DATABASE=postgres
ENV TYPEORM_SYNCHRONIZE=false
ENV TYPEORM_LOGGING=false
ENV TYPEORM_ENTITIES=dist/server/entity/**/*.js
ENV TYPEORM_MIGRATIONS=dist/server/migration/**/*.js
ENV TYPEORM_SUBSCRIBERS=dist/server/subscriber/**/*.js

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm install
RUN npm run build  # build the frontend
RUN npm run build-server  # build the server

EXPOSE 8080
CMD [ "node", "dist/server/index.js" ]