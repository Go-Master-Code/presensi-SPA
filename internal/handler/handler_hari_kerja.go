package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type handlerHariKerja struct {
	service service.ServiceHariKerja
}

func NewHandlerHariKerja(service service.ServiceHariKerja) *handlerHariKerja {
	return &handlerHariKerja{service}
}

func (h *handlerHariKerja) GetHariKerjaAktif(c *gin.Context) {
	bulanStr := c.Query("bulan")
	bulan, err := strconv.Atoi(bulanStr)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	tahunStr := c.Query("tahun")
	tahun, err := strconv.Atoi(tahunStr)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	totalHariKerja, err := h.service.HitungHariKerja(bulan, tahun)
	if err != nil {
		helper.ErrorHitungHariKerja(c, err)
		return
	}

	// jika berhasil hitung jumlah hari kerja per bulan
	helper.StatusSuksesGetData(c, totalHariKerja)
}

func (h *handlerHariKerja) GetHariLibur(c *gin.Context) {
	hariLibur, err := h.service.GetHariLibur()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, hariLibur)
}

func (h *handlerHariKerja) DeleteHariLibur(c *gin.Context) {
	id := c.Param("id")
	idInt, err := strconv.Atoi(id)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	hariLibur, err := h.service.DeleteHariLibur(idInt)
	if err != nil {
		helper.ErrorDeleteData(c)
		return
	}

	helper.StatusSuksesDeleteData(c, hariLibur)
}

func (h *handlerHariKerja) CreateHariLibur(c *gin.Context) {
	var newHariLibur dto.CreateHariLiburRequest

	err := c.ShouldBindJSON(&newHariLibur)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	// jalankan service
	hariLibur, err := h.service.CreateHariLibur(newHariLibur)
	if err != nil {
		helper.ErrorCreateData(c, err)
		return
	}

	// jika service sukses, beri response
	helper.StatusSuksesCreateData(c, hariLibur)
}
