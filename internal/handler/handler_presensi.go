package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type handlerPresensi struct {
	service service.ServicePresensi
}

func NewHandlerPresensi(service service.ServicePresensi) *handlerPresensi {
	return &handlerPresensi{service}
}

func (h *handlerPresensi) GetAllPresensi(c *gin.Context) {
	presensi, err := h.service.GetAllPresensi()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, presensi)
}

func (h *handlerPresensi) GetPresensiByIdByPeriode(c *gin.Context) {
	// ambil semua query parameter (3)
	karyawanID := c.Query("karyawan_id")
	tanggalAwal := c.Query("tanggal_awal")
	tanggalAkhir := c.Query("tanggal_akhir")

	presensi, err := h.service.GetPresensiByIdByPeriode(karyawanID, tanggalAwal, tanggalAkhir)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// cek apakah ada row yang di return
	if len(presensi) < 1 {
		helper.ErrorDataNotFound(c)
		return
	}

	helper.StatusSuksesGetData(c, presensi)
}

func (h *handlerPresensi) GetPresensiByIdByBulanTahun(c *gin.Context) {
	// ambil semua query parameter (3)
	karyawanID := c.Query("karyawan_id")
	bulan := c.Query("bulan")

	bulanInt, err := strconv.Atoi(bulan)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	tahun := c.Query("tahun")
	tahunInt, err := strconv.Atoi(tahun)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	presensi, err := h.service.GetPresensiByIdByBulanTahun(karyawanID, bulanInt, tahunInt)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// cek apakah ada row yang di return
	if len(presensi) < 1 {
		helper.ErrorDataNotFound(c)
		return
	}

	helper.StatusSuksesGetData(c, presensi)
}

func (h *handlerPresensi) GetPresensiByBulanTahun(c *gin.Context) {
	// ambil semua query parameter (2)
	bulan := c.Query("bulan")

	bulanInt, err := strconv.Atoi(bulan)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	tahun := c.Query("tahun")
	tahunInt, err := strconv.Atoi(tahun)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	presensi, err := h.service.GetPresensiByBulanTahun(bulanInt, tahunInt)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// cek apakah ada row yang di return
	if len(presensi) < 1 {
		helper.ErrorDataNotFound(c)
		return
	}

	helper.StatusSuksesGetData(c, presensi)
}

func (h *handlerPresensi) GetPresensiHarian(c *gin.Context) {
	tanggal := c.Query("tanggal")
	presensi, err := h.service.GetPresensiHarian(tanggal)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// cek apakah ada row yang di return
	if len(presensi) < 1 {
		helper.ErrorDataNotFound(c)
		return
	}

	helper.StatusSuksesGetData(c, presensi)
}

func (h *handlerPresensi) CreatePresensi(c *gin.Context) {
	var newPresensi dto.CreatePresensiRequest
	// parsing json
	err := c.ShouldBindJSON(&newPresensi)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	newPresensiDTO, err := h.service.CreateOrUpdatePresensi(newPresensi)
	if err != nil {
		helper.ErrorCreateData(c, err)
		return
	}

	helper.StatusSuksesCreateData(c, newPresensiDTO)
}

func (h *handlerPresensi) GetPresensiByNamaPerHari(c *gin.Context) {
	nama := c.Query("nama")
	tanggal := c.Query("tanggal")

	presensi, err := h.service.GetPresensiByNamaPerHari(nama, tanggal)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, presensi)
}
