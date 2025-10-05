package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/service"

	"github.com/gin-gonic/gin"
)

type handlerKaryawan struct {
	service service.ServiceKaryawan
}

// constructor
func NewHandlerKaryawan(service service.ServiceKaryawan) *handlerKaryawan {
	return &handlerKaryawan{service}
}

// struct method
func (h *handlerKaryawan) GetAllKaryawan(c *gin.Context) {
	karyawan, err := h.service.GetAllKaryawan()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, karyawan)
}

func (h *handlerKaryawan) GetKaryawanByID(c *gin.Context) {
	// get param
	id := c.Param("id")

	karyawan, err := h.service.GetKaryawanByID(id)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, karyawan)
}

func (h *handlerKaryawan) DeleteKaryawanByID(c *gin.Context) {
	// get param
	id := c.Param("id")

	karyawan, err := h.service.DeleteKaryawanByID(id)
	// jika data tidak ditemukan
	if karyawan.ID == "" {
		helper.ErrorDataNotFound(c)
		return
	}
	// jika terjadi constraint fails saat delete
	if err != nil {
		helper.ErrorDeleteData(c)
		return
	}

	helper.StatusSuksesDeleteData(c, karyawan)
}

func (h *handlerKaryawan) CreateKaryawan(c *gin.Context) {
	var newKaryawan dto.CreateKaryawanRequest
	err := c.ShouldBindJSON(&newKaryawan)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}
	newKaryawanDTO, err := h.service.CreateKaryawan(newKaryawan)
	if err != nil {
		helper.ErrorCreateData(c, err)
		return
	}

	helper.StatusSuksesCreateData(c, newKaryawanDTO)
}

func (h *handlerKaryawan) UpdateKaryawan(c *gin.Context) {
	var updateKaryawan dto.UpdateKaryawanRequest

	// bind json
	err := c.ShouldBindJSON(&updateKaryawan)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	// tangkap param id
	id := c.Param("id")

	karyawanDTO, err := h.service.UpdateKaryawan(id, updateKaryawan)
	if err != nil {
		helper.ErrorUpdateData(c, err)
		return
	}

	helper.StatusSuksesUpdateData(c, karyawanDTO)
}
