FROM node

COPY . /github_trending

WORKDIR /github_trending

RUN npm install

CMD ["npm", "start"]
