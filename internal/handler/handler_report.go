package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/service"
	"api-presensi/internal/utils/report/presensi"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type handlerReport struct {
	service service.ServiceReport
}

func NewHandlerReport(service service.ServiceReport) *handlerReport {
	return &handlerReport{service}
}

func (h *handlerReport) GenerateReportKehadiran(c *gin.Context) { // handler untuk generate report presensi
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

	results, err := h.service.GenerateReportKehadiran(bulan, tahun)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// konversi data ke dalam bytes
	pdfBytes, err := presensi.GenerateReportPresensiAllPerBulan(bulan, tahun, results)
	if err != nil {
		helper.ErrorGenerateReport(c, err)
		return
	}

	// nama bulan string
	bulanTime := time.Month(bulan) // harus di convert ke string
	fileName := "laporan_presensi_" + bulanTime.String() + "_" + strconv.Itoa(tahun)

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename="+fileName+".pdf")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

func (h *handlerReport) GenerateReportKehadiranPerPeriode(c *gin.Context) { // handler untuk generate report presensi
	awal := c.Query("awal")
	akhir := c.Query("akhir")

	results, err := h.service.GenerateReportPresensiPerPeriode(awal, akhir)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// konversi data ke dalam bytes
	pdfBytes, err := presensi.GenerateReportPresensiAllPerPeriode(awal, akhir, results)
	if err != nil {
		helper.ErrorGenerateReport(c, err)
		return
	}

	// set file name
	fileName := "laporan_presensi_" + awal + "_sampai_" + akhir

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename="+fileName+".pdf")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

func (h *handlerReport) GetReportKehadiranPerPeriode(c *gin.Context) { // handler untuk generate report presensi
	awal := c.Query("awal")
	akhir := c.Query("akhir")

	// log.Println("Masuk handler get report kehadiran periode")
	results, err := h.service.GenerateReportPresensiPerPeriode(awal, akhir)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	helper.StatusSuksesGetData(c, results)
}
