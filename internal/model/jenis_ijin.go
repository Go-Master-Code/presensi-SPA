package model

type JenisIjin struct {
	ID    int    `json:"id" gorm:"primaryKey"`
	Kode  string `json:"kode"`
	Nama  string `json:"nama"`
	Aktif bool   `json:"aktif"`
}

func (JenisIjin) TableName() string {
	return "jenis_ijin"
}
