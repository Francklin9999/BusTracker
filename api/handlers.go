package api

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Francklin9999/BusTracker/service"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/data/tripUpdates", GetTripUpdates)
	router.GET("/data/vehiclePositions", GetVehiclePositions)
	router.GET("/data/etatservice", GetEtatService)
}

func GetTripUpdates(c *gin.Context) {
	tripUpdates, err := service.GetTripUpdates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	modifiedData, err := service.ModifyDataGetTripUpdates(tripUpdates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, modifiedData)
}

func GetVehiclePositions(c *gin.Context) {
	vehiclePositions, err := service.GetVehiclePositions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	modifiedData, err := service.ModifyDataGetVehiclePositions(vehiclePositions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, modifiedData)
}

func GetEtatService(c *gin.Context) {
	etatService, err := service.GetEtatService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	modifiedData, err := service.ModifyDataEtatService(etatService)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, modifiedData)
}

