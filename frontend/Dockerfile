FROM node:20 AS frontend-builder

WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm install

COPY . .
RUN ng build

FROM nginx:alpine

COPY --from=frontend-builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

