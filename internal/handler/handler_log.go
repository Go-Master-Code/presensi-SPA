package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/service"

	"github.com/gin-gonic/gin"
)

type handlerLog struct {
	service service.ServiceLog
}

func NewHandlerAuditLog(service service.ServiceLog) *handlerLog {
	return &handlerLog{service}
}

func (h *handlerLog) CreateLog(c *gin.Context) {
	var req dto.CreateLog

	err := c.ShouldBindJSON(&req)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	logDTO, err := h.service.CreateLog(req)
	if err != nil {
		helper.ErrorCreateData(c, err)
		return
	}

	helper.StatusSuksesCreateData(c, logDTO)
}
