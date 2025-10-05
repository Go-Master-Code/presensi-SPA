package dto

type CreatePresensiRequest struct {
	// ID           int       `json:"id" gorm:"primaryKey"`
	KaryawanID  string `json:"karyawan_id" binding:"required"`
	Tanggal     string `json:"tanggal" binding:"required"`
	WaktuMasuk  string `json:"waktu_masuk" binding:"required"`
	WaktuPulang string `json:"waktu_pulang"` // tidak required karena bisa dipakai untuk absen masuk / pulang
	Keterangan  string `json:"keterangan"`   // bisa ada bisa ngga (optional)
}

type UpdatePresensiRequest struct {
	// ID           int       `json:"id" gorm:"primaryKey"`
	KaryawanID  *string `json:"karyawan_id" binding:"omitempty"`
	Tanggal     *string `json:"tanggal" binding:"omitempty"`
	WaktuMasuk  *string `json:"waktu_masuk" binding:"omitempty"`
	WaktuPulang *string `json:"waktu_pulang" binding:"omitempty"`
	Keterangan  *string `json:"keterangan" binding:"omitempty"` // bisa ada bisa ngga (optional)
}

type PresensiResponse struct {
	ID           int    `json:"id" gorm:"primaryKey"`
	KaryawanID   string `json:"karyawan_id"`
	KaryawanNama string `json:"karyawan_nama"`
	Tanggal      string `json:"tanggal"`
	WaktuMasuk   string `json:"waktu_masuk"`
	WaktuPulang  string `json:"waktu_pulang"`
	Keterangan   string `json:"keterangan"`
}
