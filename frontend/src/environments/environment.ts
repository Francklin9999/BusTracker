import { environment as prod } from "./environment.prod";

export const BACKEND_PORT = '8080'
  
export const environment = {
    production: false,
    // Replace with your Google Api Key
    GoogleAPIKEY: prod.GoogleAPIKEY,
    apiUrl: `http://localhost:${BACKEND_PORT}`,
    wsApiUrl: `ws://localhost:${BACKEND_PORT}`,
};
  