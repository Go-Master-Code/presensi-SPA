package model

import (
	"time"

	"gorm.io/gorm"
)

type Karyawan struct {
	ID        string         `json:"id" gorm:"primaryKey"`
	Nama      string         `json:"nama"`
	JenjangID int            `json:"jenjang_id"`
	Jenjang   Jenjang        `json:"jenjang" gorm:"foreignKey:JenjangID;references:ID"` // relasi ke tabel jenjang
	Aktif     bool           `json:"aktif"`                                             // tipe data mysql TINYINT(1)
	Presensi  []Presensi     // reverse relation: 1 karyawan melakukan banyak data presensi
	CreatedAt time.Time      `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time      `gorm:"column:updated_at;autoCreateTime;autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at"` //tipe datanya bukan time.Time tapi gorm.DeletedAt -> penanda soft delete
}

func (Karyawan) TableName() string {
	return "karyawan"
}
