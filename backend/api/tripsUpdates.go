package api

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/Francklin9999/BusTracker/service"
	"github.com/gorilla/websocket"
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

func scheduleAPICallsTripUpdates(ws *websocket.Conn, stopChan chan struct{}) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-stopChan:
			log.Println("Stopping tripUpdates")
			return
		case <-ticker.C:
			handleTripUpdates()
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

func transormfTripUpdates(jsonData []byte) map[string][]StopData {

	err := loadTripDirection()
	if err != nil {
		log.Println("Error while loading trip direction: ", err)
		return nil
	}

	var root Root
	if err := json.Unmarshal([]byte(jsonData), &root); err != nil {
		log.Println("Error unmarshalling JSON: %v", err)
	}

	stopMap := make(map[string][]StopData)

	for _, entity := range root.Entity {
		for _, stopTimeUpdate := range entity.TripUpdate.StopTimeUpdate {
			stopId := stopTimeUpdate.StopId
			tripId := entity.TripUpdate.Trip.TripId
			busDirection := tripDirectionMap[tripId]
			stopData := StopData{
				Id:                   entity.Id,
				Arrival:              stopTimeUpdate.Arrival,
				ScheduleRelationship: stopTimeUpdate.ScheduleRelationship,
				RouteId:              entity.TripUpdate.Trip.RouteId,
				Direction:            busDirection,
			}

			if _, exists := stopMap[stopId]; !exists {
				stopMap[stopId] = []StopData{}
			}

			stopMap[stopId] = append(stopMap[stopId], stopData)
		}
	}
	return stopMap
}

func selectedTripUpdates(data []interface{}) (map[string][]StopData, error) {
	if data == nil {
		return stopIds, nil
	}

	filteredStopIds := make(map[string][]StopData)
	for _, item := range data {
		var stopId string

		if id, ok := item.(float64); ok {
			stopId = fmt.Sprintf("%.0f", id)
		} else if id, ok := item.(string); ok {
			stopId = id
		} else {
			return nil, fmt.Errorf("invalid item type: %T", item)
		}

		if stopData, exists := stopIds[stopId]; exists {
			filteredStopIds[stopId] = stopData
		}
	}

	return filteredStopIds, nil
}
