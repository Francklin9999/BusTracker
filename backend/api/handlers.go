package api

import (
	// "fmt"
	"net/http"
	// "os"
	"encoding/json"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var stopIds map[string][]StopData

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Todo check origin
		return true
	},
}

var stopVehiclePositions chan struct{}
var tripUpdates chan struct{}

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

		var request struct {
			Action string `json:"action"`
			Params struct {
				DataArray       []interface{} `json:"dataArray"`
				AdditionalParam string        `json:"additionalParam"`
			} `json:"params"`
		}

		if err := json.Unmarshal(message, &request); err != nil {
			log.Println("Error while parsing message: ", err)
			continue
		}

		switch request.Action {
		case "tripUpdates":
			if stopIds == nil {
				handleTripUpdates()
				tripUpdates = make(chan struct{})
				go scheduleAPICallsTripUpdates(ws, tripUpdates)
			}
			data, err := selectedTripUpdates(request.Params.DataArray)
			if err != nil {
				log.Println("Error while processing trip updates: ", err)
				// c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			}
			ws.WriteJSON(map[string]map[string][]StopData{"Trip Updates": data})
		case "tripUpdateClosed":
			if tripUpdates != nil {
				close(tripUpdates)
			}
		case "vehiclePositions":
			data2, err := GetVehiclePositions()
			if err != nil {
				log.Println("Error while getting vehicle positions: ", err)
				// c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
				return
			}
			err = ws.WriteJSON(map[string]string{"vehiclePositions": data2})
			if err != nil {
				ws.WriteJSON(map[string]string{"vehiclePositions": "Error fetching vehiclePositions"})
				// c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			}
			stopVehiclePositions = make(chan struct{})
			go scheduleAPICallsVehiclePositions(ws, stopVehiclePositions)
		case "vehiclePositionsClosed":
			if stopVehiclePositions != nil {
				close(stopVehiclePositions)
			}
		default:
			err = ws.WriteMessage(websocket.TextMessage, []byte("Invalid request"))
			if err != nil {
				log.Println("Error while writing error fetching message: ", err)
				// c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request action"})
				return
			}
		}
	}
}
