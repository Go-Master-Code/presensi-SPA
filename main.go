package main

import (
	"api-presensi/internal/database"
	"api-presensi/internal/handler"
	"api-presensi/internal/repository"
	"api-presensi/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB() // initDB + cek koneksi

	r := gin.Default()

	// dependency injection user
	repoUser := repository.NewRepositoryUser(database.DB)
	serviceUser := service.NewServiceUser(repoUser)
	handlerUser := handler.NewHandlerUser(serviceUser)

	// list handler user
	r.GET("/api/user", handlerUser.GetAllUser)
	r.GET("/api/user/:id", handlerUser.GetUserByID)
	r.GET("/api/user/search", handlerUser.GetUserByQueryParameter)
	r.DELETE("/api/user/:id", handlerUser.DeleteUserByID)
	r.POST("/api/user", handlerUser.CreateUser)
	r.PUT("/api/user/:id", handlerUser.UpdateUser)

	// dependency injection karyawan
	repoKaryawan := repository.NewRepositoryKaryawan(database.DB)
	serviceKaryawan := service.NewServiceKaryawan(repoKaryawan)
	handlerKaryawan := handler.NewHandlerKaryawan(serviceKaryawan)

	r.GET("/api/karyawan", handlerKaryawan.GetAllKaryawan)
	r.GET("/api/karyawan/:id", handlerKaryawan.GetKaryawanByID)
	r.DELETE("/api/karyawan/:id", handlerKaryawan.DeleteKaryawanByID)
	r.POST("/api/karyawan", handlerKaryawan.CreateKaryawan)
	r.PUT("/api/karyawan/:id", handlerKaryawan.UpdateKaryawan)

	// dependency injection user
	repoJenisIjin := repository.NewRepositoryJenisIjin(database.DB)
	serviceJenisIjin := service.NewServiceJenisIjin(repoJenisIjin)
	handlerJenisIjin := handler.NewHandlerJenisIjin(serviceJenisIjin)

	// list handler user
	r.GET("/api/jenis_ijin", handlerJenisIjin.GetAllJenisIjin)
	r.POST("/api/jenis_ijin", handlerJenisIjin.CreateJenisIjin)
	r.PUT("/api/jenis_ijin/update", handlerJenisIjin.UpdateJenisIjinAktif)

	// dependency injection presensi
	repoPresensi := repository.NewRepositoryPresensi(database.DB)
	servicePresensi := service.NewServicePresensi(repoPresensi)
	handlerPresensi := handler.NewHandlerPresensi(servicePresensi)

	// list handler presensi
	r.GET("/api/presensi", handlerPresensi.GetAllPresensi)
	r.GET("/api/presensi/by_periode", handlerPresensi.GetPresensiByIdByPeriode)
	r.GET("/api/presensi/karyawan_per_bulan", handlerPresensi.GetPresensiByIdByBulanTahun)
	r.GET("/api/presensi/by_month", handlerPresensi.GetPresensiByBulanTahun)
	r.POST("/api/presensi", handlerPresensi.CreatePresensi)

	// dependency injection hari kerja
	repoHariKerja := repository.NewRepositoryHariLibur(database.DB)
	serviceHariKerja := service.NewServiceHariLibur(repoHariKerja)
	handlerHariKerja := handler.NewHandlerHariKerja(serviceHariKerja)

	// list handler hari kerja
	r.GET("/api/hari_kerja_aktif", handlerHariKerja.GetHariKerjaAktif)

	// dependency injection jenjang
	repoJenjang := repository.NewRepositoryJenjang(database.DB)
	serviceJenjang := service.NewServiceJenjang(repoJenjang)
	handlerJenjang := handler.NewHandlerJenjang(serviceJenjang)

	// list handler jenjang
	r.GET("/api/jenjang", handlerJenjang.GetAllJenjang)

	// handler untuk frontend
	r.Static("/css", "./frontend/css")
	r.Static("/js", "./frontend/js")
	r.Static("/assets", "./frontend/assets")

	r.GET("/", func(c *gin.Context) {
		c.File("./frontend/pages/index.html")
	})
	r.GET("/karyawan", func(c *gin.Context) {
		c.File("./frontend/pages/karyawan.html")
	})

	// run server
	r.Run("0.0.0.0:8080")
}
