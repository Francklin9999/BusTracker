package api

import (
	"log"
	"time"
	"github.com/gorilla/websocket"
	"github.com/Francklin9999/BusTracker/service"
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

	return modifiedData, nil
}

func scheduleAPICallsVehiclePositions(ws *websocket.Conn) {
    ticker := time.NewTicker(1 * time.Minute) 
	defer ticker.Stop()
	for {
		select {
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