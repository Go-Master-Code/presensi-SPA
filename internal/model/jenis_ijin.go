package model

type JenisIjin struct {
	ID           int            `json:"id" gorm:"primaryKey"`
	Kode         string         `json:"kode"`
	Nama         string         `json:"nama"`
	Aktif        bool           `json:"aktif"`
	IjinKaryawan []IjinKaryawan // reverse relation: 1 jneis ijin bisa buat banyak ijin karyawan
}

func (JenisIjin) TableName() string {
	return "jenis_ijin"
}
