package api

import (
	// "fmt"
	"net/http"
	// "os"
	"log"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/Francklin9999/BusTracker/service"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Todo check origin
		return true
	},
}

func SetupRoutes(router *gin.Engine) {
	router.GET("/", handleWebSocket)
}

func GetTripUpdates(c *gin.Context) (string, error) {
	tripUpdates, err := service.GetTripUpdates()
	if err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return "", nil
	}
	
	modifiedData, err := service.ModifyDataGetTripUpdates(tripUpdates)
	if err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return "", nil
	}

	// fileName := "modified_trip_updates.json"
	// if err := writeToFile(fileName, modifiedData); err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to write data to file"})
	// 	return
	// }

	// c.JSON(http.StatusOK, modifiedData)
	return modifiedData, nil
}

// func writeToFile(fileName, data string) error {
// 	file, err := os.Create(fileName)
// 	if err != nil {
// 		return fmt.Errorf("error creating file: %w", err)
// 	}
// 	defer file.Close()

// 	_, err = file.WriteString(data)
// 	if err != nil {
// 		return fmt.Errorf("error writing to file: %w", err)
// 	}

// 	return nil
// }

func GetVehiclePositions(c *gin.Context) (string, error) {
	vehiclePositions, err := service.GetVehiclePositions()
	if err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return "", nil
	}
	
	modifiedData, err := service.ModifyDataGetVehiclePositions(vehiclePositions)
	if err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return "", nil
	}

	// c.JSON(http.StatusOK, modifiedData)
	return modifiedData, nil
}

func GetEtatService(c *gin.Context) (string, error) {
	etatService, err := service.GetEtatService()
	if err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return "", err
	}
	
	modifiedData, err := service.ModifyDataEtatService(etatService)
	if err != nil {
		// c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return "", err
	}

	// c.JSON(http.StatusOK, modifiedData)
	return modifiedData, nil
}

func handleWebSocket(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Error while upgrading connection: ", err)
		return
	}
	defer ws.Close()

	log.Println("WebSocket client connected")

	go scheduleAPICalls(ws)

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Println("Error while reading message: ", err)
			return
		}

		log.Println("Received message: ", string(message))
		
		switch string(message) {
		case "tripUpdates":
			data, err := GetTripUpdates(c)
			if err != nil {
				log.Println("Error while getting trip updates: ", err)
				return
				}
			err = ws.WriteJSON(map[string]string{"tripUpdates": data})
			if err != nil {
				ws.WriteJSON(map[string]string{"tripUpdates": "Error fetching tripUpdates"})
			}
		case "vehiclePositions":
			data, err := GetVehiclePositions(c)
			if err != nil {
				log.Println("Error while getting vehicle positions: ", err)
				return
				}
			err = ws.WriteJSON(map[string]string{"vehiclePositions": data})
			if err != nil {
				ws.WriteJSON(map[string]string{"vehiclePositions": "Error fetching vehiclePositions"})
			}
		case "etatservice":
			data, err := GetEtatService(c)
			if err != nil {
				log.Println("Error while getting etats de service: ", err)
				return
				}
			err = ws.WriteJSON(map[string]string{"etatservice": data})
			if err != nil {
				ws.WriteJSON(map[string]string{"etatservice": "Error fetching etatservice"})
			}
		default:
            err = ws.WriteMessage(websocket.TextMessage, []byte("Invalid request"))
			if err != nil {
				log.Println("Error while writing error fetching message: ", err)
				return
				}
		}
	}
}

func scheduleAPICalls(ws *websocket.Conn) {
    ticker1 := time.NewTicker(1 * time.Minute) 
    ticker2 := time.NewTicker(10 * time.Minute)
	ticker3 := time.NewTicker(12 * time.Minute)

    defer ticker1.Stop()
    defer ticker2.Stop()
	defer ticker3.Stop()

    for {
        select {
        case <-ticker1.C:
            data1, err := service.GetTripUpdates()
			if err != nil {
				log.Println("Error while getting tripUpdates: ", err)
			}
			_data1 := string(data1)
            err2 := ws.WriteJSON(map[string]string{"tripUpdates": _data1})
            if err2 != nil {
                log.Println("Error while sending tripUpdates data:", err2)
                return
            }
        case <-ticker2.C:
            data2, err := service.GetVehiclePositions()
			if err != nil {
				log.Println("Error while getting vehiclePositions: ", err)
				}
            err2 := ws.WriteJSON(map[string]string{"vehiclePositions": string(data2)})
            if err2 != nil {
                log.Println("Error while sending vehiclePositions data:", err2)
                return
            }
		case <-ticker3.C:
            data3, err := service.GetEtatService()
			if err != nil {
				log.Println("Error while getting etatservice: ", err)
				}
            err2 := ws.WriteJSON(map[string]string{"etatservice": string(data3)})
            if err2 != nil {
                log.Println("Error while sending etatservice data:", err2)
                return
            }
        }
    }
}