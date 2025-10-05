package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/service"

	"github.com/gin-gonic/gin"
)

type handlerJenjang struct {
	service service.ServiceJenjang
}

func NewHandlerJenjang(service service.ServiceJenjang) *handlerJenjang {
	return &handlerJenjang{service}
}

func (h *handlerJenjang) GetAllJenjang(c *gin.Context) {
	jenjang, err := h.service.GetAllJenjang()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, jenjang)
}
