FROM node:alpine AS build-js

ADD ./app /src

RUN cd /src && npm install && npm run build

FROM golang:alpine AS build-go

ADD . /src
RUN cd /src && go build -o egg-stonks

FROM alpine
WORKDIR /app
COPY --from=build-go /src/egg-stonks /app/
COPY --from=build-js /src/dist /app/dist

ENV WEBROOT=/app/dist

ENTRYPOINT /app/egg-stonks
