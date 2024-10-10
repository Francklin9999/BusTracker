
# Real-Time Bus Tracking App

This project is a real-time bus tracking application that provides live data for Montreal's public transport system, including buses, metro, and trains. Using WebSockets, it displays the real-time positions of buses on an interactive Google Map, enabling users to see which buses are arriving based on their current location. With features like interactive mapping through the Google Maps API, users can create their itineraries seamlessly and receive location-based alerts to help plan their journeys effectively.

## Screenshots

![App Screenshot](https://github.com/user-attachments/assets/8005ce61-0c6d-4034-96ae-c020127a4683)

## Features
- Track Bus in real time
- Itinerary planner
- STM Transit Updates
- Light/dark mode toggle


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY` for your STM API KEY


## Run Locally

Clone the project :

```bash
git clone https://github.com/Francklin9999/BusTracker
```
Go to the project server directory :

```bash
  cd BusTracker/backend/cmd/server
```

If you have docker you can use the docker images.

Create a .env file at the root with API_KEY="YOUR STM API_KEY".

Create a environment.ts file in frontend/src/environments/ and set you Google API_KEY as follow:

export const environment = {
    production: true,       GoogleAPIKEY:'',
};

Run the command :

```bash
  docker-compose build
```
If you don't have docker follow these steps.

Install dependencies

```bash
  go mod tidy
```

Create a .env file with API_KEY="YOUR STM API_KEY"

Start the server

```bash
  go run main.go
```
Open a new terminal

Go to the project client directory

```bash
  cd BusTracker/frontend
```

Install dependencies

```bash
  npm install
```

Create a environment.ts file in src/environments/ and set you Google API_KEY as follow:

export const environment = {
    production: true,       GoogleAPIKEY:'',
};

Start the server

```bash
  ng server
```


## Tech Stack

**Client:** Angular

**Server:** Go, Gin


## Support

For support, email franckfongang99@gmail.com or open an issue.


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://franckfongang.io/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fongangf/)

