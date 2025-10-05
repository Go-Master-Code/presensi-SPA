package model

import "time"

type HariLibur struct {
	ID         int       `json:"id" gorm:"primaryKey"`
	Tanggal    time.Time `json:"tanggal"`
	Keterangan string    `json:"keterangan"`
	CreatedAt  time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt  time.Time `gorm:"column:updated_at;autoCreateTime;autoUpdateTime"`
}

func (HariLibur) TableName() string {
	return "hari_libur"
}
