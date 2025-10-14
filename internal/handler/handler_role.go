package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/service"

	"github.com/gin-gonic/gin"
)

// struct implementasi
type handlerRole struct {
	service service.ServiceRole
}

// constructor
func NewHandlerRole(service service.ServiceRole) *handlerRole {
	return &handlerRole{service}
}

// struct method
func (h *handlerRole) GetAllRole(c *gin.Context) {
	roles, err := h.service.GetAllRole()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, roles)
}
