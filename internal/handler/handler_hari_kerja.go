package handler

import (
	"api-presensi/helper"
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
