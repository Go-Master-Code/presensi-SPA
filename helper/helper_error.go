package helper

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AllErrors struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Error   any    `json:"error"`
}

func ErrorFetchDataFromDB(c *gin.Context, err error) {
	c.JSON(http.StatusInternalServerError, AllErrors{
		Code:    http.StatusInternalServerError,
		Error:   err.Error(),
		Message: "gagal tarik data dari database",
	})
}

func ErrorParsingAtoi(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, AllErrors{
		Code:    http.StatusBadRequest,
		Error:   err.Error(),
		Message: "gagal parsing parameter ke integer",
	})
}

func ErrorParsingBoolean(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, AllErrors{
		Code:    http.StatusBadRequest,
		Error:   err.Error(),
		Message: "gagal parsing string ke bool",
	})
}

func StatusSuksesGetData(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "sukses get data",
		"data":    data,
	})
}

func StatusSuksesDeleteData(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "sukses delete data",
		"data":    data,
	})
}

func StatusSuksesCreateData(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "sukses create data",
		"data":    data,
	})
}

func StatusSuksesUpdateData(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "sukses update data",
		"data":    data,
	})
}

func ErrorEndpointNotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, AllErrors{
		Code:    http.StatusNotFound,
		Message: "endpoint tidak ditemukan",
		Error:   errors.New("endpoint tidak ditemukan").Error(),
	})
}

func ErrorDataNotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, AllErrors{
		Code:    http.StatusNotFound,
		Message: "data tidak ditemukan",
		Error:   errors.New("data tidak ditemukan").Error(),
	})
}

func ErrorDeleteData(c *gin.Context) {
	c.JSON(http.StatusConflict, AllErrors{
		Code:    http.StatusConflict,
		Message: "gagal hapus data, periksa constraint",
		Error:   errors.New("gagal hapus data, periksa constraint").Error(),
	})
}

func ErrorCreateData(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, AllErrors{
		Code:    http.StatusBadRequest,
		Message: "gagal tambah data",
		Error:   err.Error(),
	})
}

func ErrorUpdateData(c *gin.Context, err error) {
	c.JSON(http.StatusConflict, AllErrors{
		Code:    http.StatusConflict,
		Message: "gagal update data, periksa request body",
		Error:   err.Error(),
	})
}

func ErrorParsingRequestBody(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, AllErrors{
		Code:    http.StatusBadRequest,
		Message: "gagal parsing request body, periksa input",
		Error:   err.Error(),
	})
}

func ErrorParsingDate(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, AllErrors{
		Code:    http.StatusBadRequest,
		Message: "gagal parsing tanggal, periksa input",
		Error:   err.Error(),
	})
}

func ErrorHashingPassword(c *gin.Context, err error) {
	c.JSON(http.StatusInternalServerError, AllErrors{
		Code:    http.StatusInternalServerError,
		Message: "gagal hash password user",
		Error:   err.Error(),
	})
}

func ErrorHitungHariKerja(c *gin.Context, err error) {
	c.JSON(http.StatusInternalServerError, AllErrors{
		Code:    http.StatusInternalServerError,
		Message: "gagal hitung hari kerja dalam 1 bulan",
		Error:   err.Error(),
	})
}

func ErrorGenerateReport(c *gin.Context, err error) {
	c.JSON(http.StatusInternalServerError, AllErrors{
		Code:    http.StatusInternalServerError,
		Message: "gagal generate report",
		Error:   err.Error(),
	})
}
