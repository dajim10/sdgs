FROM node:16.17.0


WORKDIR /app

COPY . . 

ENV PATH /app/node_modules/.bin:$PATH

RUN npm install

CMD ["npm","start"]