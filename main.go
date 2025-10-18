package main

import (
	"api-presensi/internal/database"
	"api-presensi/internal/handler"
	"api-presensi/internal/middleware"
	"api-presensi/internal/repository"
	"api-presensi/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB() // initDB + cek koneksi

	// dependency injection logger
	repoLog := repository.NewRepositoryLog(database.DB)
	serviceLog := service.NewServiceLog(repoLog)

	r := gin.Default()

	// middleware log global (hanya untuk POST, PUT, dan DELETE)
	r.Use(middleware.RequestLogger(serviceLog))

	// Tambahkan ini
	r.Use(cors.Default())

	// buat group route api
	api := r.Group("/api")

	// dependency injection presensi
	repoPresensi := repository.NewRepositoryPresensi(database.DB)
	servicePresensi := service.NewServicePresensi(repoPresensi)
	handlerPresensi := handler.NewHandlerPresensi(servicePresensi)
	api.POST("/presensi", handlerPresensi.CreatePresensi)

	// endpoint login sebelum bisa mengakses endpoint lainnya
	api.POST("/login", handler.Login()) // contoh penggunaan rate limiter pada handler login

	// Laporan (masukkan juga ke dalam grup)
	laporan := r.Group("/laporan")

	api.Use(middleware.AuthRequired()) //file auth_handler.go -> handler ini dieksekusi dulu sebeleum eksekusi handler endpoint
	{
		// dependency injection role
		repoRole := repository.NewRepositoryRole(database.DB)
		serviceRole := service.NewServiceRole(repoRole)
		handlerRole := handler.NewHandlerRole(serviceRole)

		// list handler role
		api.GET("/role", handlerRole.GetAllRole)

		// dependency injection user
		repoUser := repository.NewRepositoryUser(database.DB)
		serviceUser := service.NewServiceUser(repoUser)
		handlerUser := handler.NewHandlerUser(serviceUser)

		// list handler user
		api.GET("/user", handlerUser.GetAllUser)
		api.GET("/user/:id", handlerUser.GetUserByID)
		api.GET("/user/search", handlerUser.GetUserByQueryParameter)
		api.DELETE("/user/:id", handlerUser.DeleteUserByID)
		api.POST("/user", middleware.RequestLogger(serviceLog), handlerUser.CreateUser) // contoh middleware pada endpoint (lebih spesifik) bagus jika hanya ingin dipasang di endpoint tertentu
		api.PUT("/user/:id", handlerUser.UpdateUser)

		// dependency injection karyawan
		repoKaryawan := repository.NewRepositoryKaryawan(database.DB)
		serviceKaryawan := service.NewServiceKaryawan(repoKaryawan)
		handlerKaryawan := handler.NewHandlerKaryawan(serviceKaryawan)

		api.GET("/karyawan", handlerKaryawan.GetAllKaryawan)
		api.GET("/karyawan/:id", handlerKaryawan.GetKaryawanByID)
		api.DELETE("/karyawan/:id", handlerKaryawan.DeleteKaryawanByID)
		api.POST("/karyawan", handlerKaryawan.CreateKaryawan)
		api.PUT("/karyawan/:id", handlerKaryawan.UpdateKaryawan)

		// dependency injection user
		repoJenisIjin := repository.NewRepositoryJenisIjin(database.DB)
		serviceJenisIjin := service.NewServiceJenisIjin(repoJenisIjin)
		handlerJenisIjin := handler.NewHandlerJenisIjin(serviceJenisIjin)

		// list handler user
		api.GET("/jenis_ijin", handlerJenisIjin.GetAllJenisIjin)
		api.POST("/jenis_ijin", handlerJenisIjin.CreateJenisIjin)
		api.PUT("/jenis_ijin/:id", handlerJenisIjin.UpdateJenisIjin)
		api.PUT("/jenis_ijin/update", handlerJenisIjin.UpdateJenisIjinAktif)

		// dependency injection ijin karyawan
		repoIjin := repository.NewRepositoryIjinKaryawan(database.DB)
		serviceIjin := service.NewServiceIjinKaryawan(repoIjin)
		handlerIjin := handler.NewHandlerIjinKaryawan(serviceIjin)

		api.GET("/ijin", handlerIjin.GetAllIjinKaryawan)
		api.POST("/ijin", handlerIjin.CreateIjinKaryawan)
		api.PUT("/ijin/:id", handlerIjin.UpdateIjinKaryawan)

		// dependency injection dilakukan diluar Auth JWT

		// list handler presensi
		api.GET("/presensi", handlerPresensi.GetAllPresensi)
		api.GET("/presensi/by_periode", handlerPresensi.GetPresensiByIdByPeriode)
		// r.GET("/api/presensi/nama", handlerPresensi.GetPresensiByNamaPerHari)
		api.GET("/presensi/karyawan_per_bulan", handlerPresensi.GetPresensiByIdByBulanTahun)
		api.GET("/presensi/by_month", handlerPresensi.GetPresensiByBulanTahun)
		api.GET("/presensi/harian", handlerPresensi.GetPresensiHarian)
		// r.GET("/api/laporan/presensi_bulanan", handlerPresensi.GetPresensiBulananReport) // report presensi bulanan
		api.GET("/presensi/periode", handlerPresensi.GetPresensiAllPerPeriode)

		// dependency injection hari kerja
		repoHariKerja := repository.NewRepositoryHariLibur(database.DB)
		serviceHariKerja := service.NewServiceHariLibur(repoHariKerja)
		handlerHariKerja := handler.NewHandlerHariKerja(serviceHariKerja)

		// list handler hari kerja
		api.GET("/hari_kerja_aktif", handlerHariKerja.GetHariKerjaAktif)
		api.GET("/hari_libur", handlerHariKerja.GetHariLibur)
		api.DELETE("/hari_libur/:id", handlerHariKerja.DeleteHariLibur)
		api.POST("/hari_libur", handlerHariKerja.CreateHariLibur)
		api.PUT("/hari_libur/:id", handlerHariKerja.UpdateHariLibur)

		// dependency injection report
		serviceReport := service.NewServiceReport(repoHariKerja, repoPresensi)
		handlerReport := handler.NewHandlerReport(*serviceReport)

		api.GET("/laporan/presensi/periode", handlerReport.GetReportKehadiranPerPeriode) // untuk tampilkan data jumlah hari kerja dan kehadiran tiap karyawan di layar

		// dependency injection jenjang
		repoJenjang := repository.NewRepositoryJenjang(database.DB)
		serviceJenjang := service.NewServiceJenjang(repoJenjang)
		handlerJenjang := handler.NewHandlerJenjang(serviceJenjang)

		// list handler jenjang
		api.GET("/jenjang", handlerJenjang.GetAllJenjang)

		// group route laporan
		laporan.GET("/karyawan", handlerKaryawan.GetKaryawanReport)                           // report karyawan
		laporan.GET("/presensi/karyawan", handlerPresensi.GenerateReportKehadiranPerKaryawan) // untuk jadi pdf laporan presensi per karyawan per bulan
		laporan.GET("/presensi", handlerReport.GenerateReportKehadiran)                       // untuk jadi pdf laporan per bulan
		laporan.GET("/presensi/periode", handlerReport.GenerateReportKehadiranPerPeriode)     // untuk jadi pdf laporan per periode

	}

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

	// Route untuk ke login ke dashboard
	r.GET("/login", func(c *gin.Context) {
		c.File("./frontend/pages/login.html")
	})

	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	// run server
	r.Run("localhost:8080")
}
