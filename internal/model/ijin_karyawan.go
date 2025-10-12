package model

import (
	"time"

	"gorm.io/gorm"
)

type IjinKaryawan struct {
	ID          int            `json:"id" gorm:"primaryKey"`
	Tanggal     time.Time      `json:"tanggal"`
	KaryawanID  string         `json:"karyawan_id"`
	Karyawan    Karyawan       `json:"karyawan" gorm:"foreignKey:KaryawanID;references:ID"` // relasi ke tabel karyawan (master)
	JenisIjinID int            `json:"jenis_ijin_id"`
	JenisIjin   JenisIjin      `json:"jenis_ijin" gorm:"foreignKey:JenisIjinID;references:ID"` // relasi ke tabel jenis ijin (master)
	Keterangan  string         `json:"keterangan"`
	CreatedAt   time.Time      `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"column:updated_at;autoCreateTime;autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at"` //tipe datanya bukan time.Time tapi gorm.DeletedAt -> penanda soft delete
}

func (IjinKaryawan) TableName() string {
	return "ijin_karyawan"
}
