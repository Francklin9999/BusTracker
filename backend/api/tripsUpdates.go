package api

import (
	"log"
	"time"
	"encoding/json"
	"github.com/gorilla/websocket"
	"github.com/Francklin9999/BusTracker/service"
)

func GetTripUpdates() (string, error) {
	tripUpdates, err := service.GetTripUpdates()
	if err != nil {
		return "", nil
	}
	
	modifiedData, err := service.ModifyDataGetTripUpdates(tripUpdates)
	if err != nil {
		return "", nil
	}

	return modifiedData, nil
}

func scheduleAPICallsTripUpdates(ws *websocket.Conn) {
    ticker := time.NewTicker(1 * time.Minute) 
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			handleTripUpdates()
			ws.WriteJSON(map[string]map[string][]StopData{"Trip Updates": stopIds})
		}
	}
}

func handleTripUpdates() {
	data1, err := GetTripUpdates()
	if err != nil {
		log.Println("Error while getting trip updates: ", err)
		return
		}
	stopIds = transormfTripUpdates([]byte(data1))
}

func transormfTripUpdates(jsonData []byte) (map[string][]StopData) {

	var root Root
		if err := json.Unmarshal([]byte(jsonData), &root); err != nil {
			log.Fatalf("Error unmarshalling JSON: %v", err)
		}

		stopMap := make(map[string][]StopData)

		for _, entity := range root.Entity {
			for _, stopTimeUpdate := range entity.TripUpdate.StopTimeUpdate {
				stopId := stopTimeUpdate.StopId
				stopData := StopData{
					Id:                   entity.Id,
					Arrival:              stopTimeUpdate.Arrival,
					ScheduleRelationship: stopTimeUpdate.ScheduleRelationship,
				}

				if _, exists := stopMap[stopId]; !exists {
					stopMap[stopId] = []StopData{}
				}

				stopMap[stopId] = append(stopMap[stopId], stopData)
			}
		}
		return stopMap;
}