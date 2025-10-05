package model

type Jenjang struct {
	ID       int        `json:"id" gorm:"primaryKey"`
	Nama     string     `json:"nama"`
	Karyawan []Karyawan // reverse relation: 1 jenjang bisa buat banyak karyawan
}

func (Jenjang) TableName() string {
	return "jenjang"
}
