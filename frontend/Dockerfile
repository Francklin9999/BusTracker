FROM node:20 AS frontend-builder

WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm install

COPY . .
RUN ng build 

# FROM nginx:alpine

# COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# EXPOSE 80

EXPOSE 4200

CMD ["ng", "serve"]

