package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

// struct implementasi
type handlerJenisIjin struct {
	service service.ServiceJenisIjin
}

// constructor
func NewHandlerJenisIjin(service service.ServiceJenisIjin) *handlerJenisIjin {
	return &handlerJenisIjin{service}
}

// struct method
func (h *handlerJenisIjin) GetAllJenisIjin(c *gin.Context) {
	jenisIjin, err := h.service.GetAllJenisIjin()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, jenisIjin)
}

func (h *handlerJenisIjin) CreateJenisIjin(c *gin.Context) {
	// bind json request body
	var jenisIjin dto.CreateJenisIjinRequest
	err := c.ShouldBindJSON(&jenisIjin)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	newJenisIjinDTO, err := h.service.CreateJenisIjin(jenisIjin)
	if err != nil {
		helper.ErrorCreateData(c, err)
		return
	}

	helper.StatusSuksesCreateData(c, newJenisIjinDTO)
}

func (h *handlerJenisIjin) UpdateJenisIjinAktif(c *gin.Context) {
	aktif := c.Query("aktif")
	aktifBool, err := strconv.ParseBool(aktif)
	if err != nil {
		helper.ErrorParsingBoolean(c, err)
		return
	}

	id := c.Query("id")
	idInt, err := strconv.Atoi(id)

	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	updateJenisIjinDTO, err := h.service.UpdateJenisIjinAktif(idInt, aktifBool)
	if err != nil {
		helper.ErrorUpdateData(c, err)
		return
	}

	helper.StatusSuksesUpdateData(c, updateJenisIjinDTO)
}
