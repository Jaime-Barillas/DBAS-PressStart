FROM node:10.16.3-alpine

WORKDIR /home/node/app

RUN apk add --no-cache postgresql && \
    mkdir /run/postgresql && \
    chown node:node /run/postgresql

COPY package.json /home/node/app/
RUN chown -R node:node /home/node/app

USER node
RUN npm install

ENV PGDATA /home/node/pgdata
RUN initdb && pg_ctl start &&\
    createuser -w -d pressstartadmin && \
    pg_ctl stop

ENV PORT 8000
EXPOSE $PORT

CMD [ "/bin/sh" ]
