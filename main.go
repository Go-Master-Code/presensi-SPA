package main

import (
	"api-presensi/internal/database"
	"api-presensi/internal/handler"
	"api-presensi/internal/repository"
	"api-presensi/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB() // initDB + cek koneksi

	r := gin.Default()

	// Tambahkan ini
	r.Use(cors.Default())

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
	r.GET("/laporan/karyawan", handlerKaryawan.GetKaryawanReport) // report karyawan
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
	r.PUT("/api/jenis_ijin/:id", handlerJenisIjin.UpdateJenisIjin)
	r.PUT("/api/jenis_ijin/update", handlerJenisIjin.UpdateJenisIjinAktif)

	// dependency injection ijin karyawan
	repoIjin := repository.NewRepositoryIjinKaryawan(database.DB)
	serviceIjin := service.NewServiceIjinKaryawan(repoIjin)
	handlerIjin := handler.NewHandlerIjinKaryawan(serviceIjin)

	r.GET("api/ijin", handlerIjin.GetAllIjinKaryawan)
	r.POST("api/ijin", handlerIjin.CreateIjinKaryawan)
	r.PUT("api/ijin/:id", handlerIjin.UpdateIjinKaryawan)

	// dependency injection presensi
	repoPresensi := repository.NewRepositoryPresensi(database.DB)
	servicePresensi := service.NewServicePresensi(repoPresensi)
	handlerPresensi := handler.NewHandlerPresensi(servicePresensi)

	// list handler presensi
	r.GET("/api/presensi", handlerPresensi.GetAllPresensi)
	r.GET("/api/presensi/by_periode", handlerPresensi.GetPresensiByIdByPeriode)
	r.GET("/api/presensi/nama", handlerPresensi.GetPresensiByNamaPerHari)
	r.GET("/api/presensi/karyawan_per_bulan", handlerPresensi.GetPresensiByIdByBulanTahun)
	r.GET("/api/presensi/by_month", handlerPresensi.GetPresensiByBulanTahun)
	r.GET("/api/presensi/harian", handlerPresensi.GetPresensiHarian)
	// r.GET("/api/laporan/presensi_bulanan", handlerPresensi.GetPresensiBulananReport) // report presensi bulanan
	r.GET("/api/presensi/periode", handlerPresensi.GetPresensiAllPerPeriode)
	r.POST("/api/presensi", handlerPresensi.CreatePresensi)
	r.GET("/laporan/presensi/karyawan", handlerPresensi.GenerateReportKehadiranPerKaryawan) // untuk jadi pdf laporan presensi per karyawan per bulan

	// dependency injection hari kerja
	repoHariKerja := repository.NewRepositoryHariLibur(database.DB)
	serviceHariKerja := service.NewServiceHariLibur(repoHariKerja)
	handlerHariKerja := handler.NewHandlerHariKerja(serviceHariKerja)

	// list handler hari kerja
	r.GET("/api/hari_kerja_aktif", handlerHariKerja.GetHariKerjaAktif)
	r.GET("/api/hari_libur", handlerHariKerja.GetHariLibur)
	r.DELETE("/api/hari_libur/:id", handlerHariKerja.DeleteHariLibur)
	r.POST("/api/hari_libur", handlerHariKerja.CreateHariLibur)
	r.PUT("/api/hari_libur/:id", handlerHariKerja.UpdateHariLibur)

	// dependency injection report
	serviceReport := service.NewServiceReport(repoHariKerja, repoPresensi)
	handlerReport := handler.NewHandlerReport(*serviceReport)
	// list handler hari kerja
	r.GET("/laporan/presensi", handlerReport.GenerateReportKehadiran)                   // untuk jadi pdf laporan per bulan
	r.GET("/laporan/presensi/periode", handlerReport.GenerateReportKehadiranPerPeriode) // untuk jadi pdf laporan per periode
	r.GET("/api/laporan/presensi/periode", handlerReport.GetReportKehadiranPerPeriode)  // untuk tampilkan data jumlah hari kerja dan kehadiran tiap karyawan di layar

	// dependency injection jenjang
	repoJenjang := repository.NewRepositoryJenjang(database.DB)
	serviceJenjang := service.NewServiceJenjang(repoJenjang)
	handlerJenjang := handler.NewHandlerJenjang(serviceJenjang)

	// list handler jenjang
	r.GET("/api/jenjang", handlerJenjang.GetAllJenjang)

	// dependency injection role
	repoRole := repository.NewRepositoryRole(database.DB)
	serviceRole := service.NewServiceRole(repoRole)
	handlerRole := handler.NewHandlerRole(serviceRole)

	// list handler role
	r.GET("/api/role", handlerRole.GetAllRole)

	// handler untuk frontend
	r.Static("/css", "./frontend/css")
	r.Static("/js", "./frontend/js")
	r.Static("/assets", "./frontend/assets")
	r.Static("/pages", "./frontend/pages")

	// Semua route frontend diarahkan ke index.html
	r.GET("/", func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	// Route untuk ke sistem absensi
	r.GET("/main", func(c *gin.Context) {
		c.File("./frontend/main.html")
	})

	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/index.html")
	})
	// r.GET("/karyawan", func(c *gin.Context) {
	// 	c.File("./frontend/pages/karyawan.html")
	// })
	// r.GET("/presensi", func(c *gin.Context) {
	// 	c.File("./frontend/pages/presensi.html")
	// })

	// run server
	r.Run("localhost:8080")
}
