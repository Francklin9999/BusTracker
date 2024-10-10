package main

import (
	"github.com/Francklin9999/BusTracker/api"
	"github.com/Francklin9999/BusTracker/cmd/middleware"
	"github.com/Francklin9999/BusTracker/config"
	"github.com/Francklin9999/BusTracker/service"
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	router.Use(middleware.SetupCORS())

	cfg := config.LoadConfig()

	service.SetApiKey(cfg.APIKey)

	api.SetupRoutes(router)

	router.Run(":8080")
}
