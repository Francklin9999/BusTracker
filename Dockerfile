FROM golang:1.23 AS builder

WORKDIR /app

COPY ./backend .

RUN go build -o server ./cmd/server/main.go

FROM node:20 AS frontend-builder

WORKDIR /app/frontend

RUN npm install -g @angular/cli

COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend/ .
RUN ng build 

FROM ubuntu:22.04

WORKDIR /app

COPY --from=builder /app/server .

COPY --from=frontend-builder /app/frontend/dist/ /var/www/html

COPY .env .

RUN apt-get update && apt-get install -y nginx

COPY ./nginx.conf /etc/nginx/sites-available/default

EXPOSE 8080

EXPOSE 80

CMD ["/bin/sh", "-c", "./server & nginx -g 'daemon off;'"]
