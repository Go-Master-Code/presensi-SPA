package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type handlerIjinKaryawan struct {
	service service.ServiceIjinKaryawan
}

// constructor
func NewHandlerIjinKaryawan(service service.ServiceIjinKaryawan) *handlerIjinKaryawan {
	return &handlerIjinKaryawan{service}
}

// struct method
func (h *handlerIjinKaryawan) GetAllIjinKaryawan(c *gin.Context) {
	ijin, err := h.service.GetAllIjinKaryawan()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, ijin)
}

func (h *handlerIjinKaryawan) CreateIjinKaryawan(c *gin.Context) {
	// parsing request
	var newIjin dto.CreateIjinKaryawanRequest

	err := c.ShouldBindJSON(&newIjin)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	newIjinDTO, err := h.service.CreateIjinKaryawan(newIjin)
	if err != nil {
		helper.ErrorCreateData(c, err)
		return
	}

	helper.StatusSuksesCreateData(c, newIjinDTO)
}

func (h *handlerIjinKaryawan) UpdateIjinKaryawan(c *gin.Context) {
	var updateIjin dto.UpdateIjinKaryawanRequest
	// parsing request
	err := c.ShouldBindJSON(&updateIjin)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	// get param
	id := c.Param("id")
	idString, err := strconv.Atoi(id)

	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	ijinDTO, err := h.service.UpdateIjinKaryawan(idString, updateIjin)
	if err != nil {
		helper.ErrorUpdateData(c, err)
		return
	}

	helper.StatusSuksesUpdateData(c, ijinDTO)
}
