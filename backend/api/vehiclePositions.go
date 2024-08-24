package api

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/Francklin9999/BusTracker/service"
	"github.com/gorilla/websocket"
)

func GetVehiclePositions() (string, error) {
	vehiclePositions, err := service.GetVehiclePositions()
	if err != nil {
		return "", nil
	}

	modifiedData, err := service.ModifyDataGetVehiclePositions(vehiclePositions)
	if err != nil {
		return "", nil
	}

	processData, err := processVehiclePosition(modifiedData)
	if err != nil {
		return "", nil
	}

	return processData, nil
}

func scheduleAPICallsVehiclePositions(ws *websocket.Conn, stopChan chan struct{}) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-stopChan:
			log.Println("Stopping vehicle positions updates.")
			return
		case <-ticker.C:
			data1, err := GetVehiclePositions()
			if err != nil {
				log.Println("Error while getting vehicle positions: ", err)
				continue
			}
			_data1 := string(data1)
			err2 := ws.WriteJSON(map[string]string{"vehiclePositions": _data1})
			if err2 != nil {
				log.Println("Error while sending vehiclePositions data:", err2)
				return
			}
		}
	}
}

func processVehiclePosition(text string) (string, error) {
	var data map[string]interface{}
	if err := json.Unmarshal([]byte(text), &data); err != nil {
		return "", fmt.Errorf("error parsing JSON: %v", err)
	}

	entities, ok := data["entity"].([]interface{})
	if !ok {
		return "", fmt.Errorf("error: entity field is missing or is not an array")
	}

	currentTime := time.Now().Unix()
	resultMap := make(map[string]map[string]interface{})

	for _, e := range entities {
		entity, ok := e.(map[string]interface{})
		if !ok {
			continue
		}

		vehicle, ok := entity["vehicle"].(map[string]interface{})
		if !ok {
			continue
		}

		trip, ok := vehicle["trip"].(map[string]interface{})
		if !ok {
			continue
		}

		routeID, ok := trip["routeId"].(string)
		if !ok {
			continue
		}

		timestampStr, ok := vehicle["timestamp"].(string)
		if !ok {
			continue
		}

		parsedTimestamp, err := strconv.ParseInt(timestampStr, 10, 64)
		if err != nil {
			continue
		}

		timeDiffSeconds := currentTime - parsedTimestamp

		resultMap[routeID] = map[string]interface{}{
			"tripId":          trip["tripId"],
			"position":        vehicle["position"],
			"currentStatus":   vehicle["currentStatus"],
			"timeDifference":  timeDiffSeconds,
			"occupancyStatus": vehicle["occupancyStatus"],
		}
	}

	resultJSON, err := json.Marshal(resultMap)
	if err != nil {
		return "", fmt.Errorf("error encoding result to JSON: %v", err)
	}

	return string(resultJSON), nil
}
