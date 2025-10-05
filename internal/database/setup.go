package database

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB // global var

func InitDB() {
	dsn := "root:root@tcp(127.0.0.1:3306)/presensi?charset=utf8mb4&parseTime=True&loc=Asia%2FJakarta"

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "/r/n", log.LstdFlags),
			logger.Config{
				SlowThreshold: time.Second, // tampilkan warning untuk query lambat
				LogLevel:      logger.Info, // tingkat log: Silent | Error | Warn | Info
				Colorful:      true,        // log berwarna
			},
		),
	})

	if err != nil {
		log.Fatal("Failed to connect database: ", err)
	}

	DB = db // var global agar bisa diakses dari repository
	log.Println("Berhasil terhubung ke database MySQL!")
}
