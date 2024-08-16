package api

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Francklin9999/BusTracker/service"
)

func GetEtatService(c *gin.Context) {
	etatService, err := service.GetEtatService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	
	modifiedData, err := service.ModifyDataEtatService(etatService)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	c.JSON(http.StatusOK, modifiedData)
}