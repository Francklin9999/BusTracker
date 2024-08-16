package api

import (
	// "fmt"
	"net/http"
	// "os"
	"log"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var stopIds map[string][]StopData;

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Todo check origin
		return true
	},
}

func SetupRoutes(router *gin.Engine) {
	router.GET("/ws", handleWebSocket)
	router.GET("/rs/etatservice", GetEtatService)
}

func handleWebSocket(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Error while upgrading connection: ", err)
		return
	}
	defer ws.Close()

	log.Println("WebSocket client connected")

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Println("Error while reading message: ", err)
			return
		}

		log.Println("Received message: ", string(message))
		
		switch string(message) {
		case "tripUpdates":
			handleTripUpdates()
			ws.WriteJSON(map[string]map[string][]StopData{"Trip Updates": stopIds})
			go scheduleAPICallsTripUpdates(ws)
		case "vehiclePositions":
			data2, err := GetVehiclePositions()
			if err != nil {
				log.Println("Error while getting vehicle positions: ", err)
				return
				}
			err = ws.WriteJSON(map[string]string{"vehiclePositions": data2})
			if err != nil {
				ws.WriteJSON(map[string]string{"vehiclePositions": "Error fetching vehiclePositions"})
			}
			go scheduleAPICallsVehiclePositions(ws)
		default:
            err = ws.WriteMessage(websocket.TextMessage, []byte("Invalid request"))
			if err != nil {
				log.Println("Error while writing error fetching message: ", err)
				return
				}
		}
	}
}



