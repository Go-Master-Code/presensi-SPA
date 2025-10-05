package model

import (
	"time"

	"gorm.io/gorm"
)

type Presensi struct {
	ID          int            `json:"id" gorm:"primaryKey"`
	KaryawanID  string         `json:"karyawan_id"`
	Karyawan    Karyawan       `json:"karyawan" gorm:"foreignKey:KaryawanID;references:ID"` // relasi ke tabel karyawan (master)
	Tanggal     time.Time      `json:"tanggal"`
	WaktuMasuk  string         `json:"waktu_masuk"`
	WaktuPulang string         `json:"waktu_pulang"`
	Keterangan  string         `json:"keterangan"`
	CreatedAt   time.Time      `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"column:updated_at;autoCreateTime;autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at"` //tipe datanya bukan time.Time tapi gorm.DeletedAt -> penanda soft delete
}

func (Presensi) TableName() string {
	return "presensi_karyawan"
}
