package main

import (
	// "log"
	// "time"
	"github.com/Francklin9999/BusTracker/api"
	"github.com/Francklin9999/BusTracker/config"
	"github.com/Francklin9999/BusTracker/service"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	cfg := config.LoadConfig()

	service.SetApiKey(cfg.APIKey)

	api.SetupRoutes(router)

	// go fetchLiveData()

	// ticker := time.NewTicker(4 * time.Minute)
	// defer ticker.Stop()
	// for {
	// 	select {
	// 		case <-ticker.C:
	// 			fetchLiveData()
	// 	}
	// }

	router.Run(":8080")
}

// func fetchLiveData() {
// 	log.Println("Fetching live data...")
// 	endpoint := []string{"tripUpdates", "vehiclePositions", "etatservice"}
// 	for _, endpoint := range endpoint {
// 		data, err := service.GetLiveData(endpoint)
// 		if err != nil {
// 			log.Println("Error fetching data for %s: %v", endpoint, err)
// 			continue
// 		}

// 		modifiedData := service.ModifyData(data)
// 		err = service.SendData(endpoint, modifiedData)
// 		if err != nil {
// 			log.Println("Error sending data for %s: %v", endpoint, err)
// 		}
// 	}
// }