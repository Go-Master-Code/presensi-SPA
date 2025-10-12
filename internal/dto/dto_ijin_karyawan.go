package dto

type CreateIjinKaryawanRequest struct {
	Tanggal     string `json:"tanggal"`
	KaryawanID  string `json:"karyawan_id" binding:"required,min=10,max=10"`
	JenisIjinID int    `json:"jenis_ijin_id"`
	Keterangan  string `json:"keterangan"`
}

type UpdateIjinKaryawanRequest struct {
	Tanggal     *string `json:"tanggal" binding:"omitempty"`
	KaryawanID  *string `json:"karyawan_id" binding:"omitempty"`
	JenisIjinID *int    `json:"jenis_ijin_id" binding:"omitempty"`
	Keterangan  *string `json:"keterangan" binding:"omitempty"`
}

type IjinKaryawanResponse struct {
	ID            int    `json:"id"`
	Tanggal       string `json:"tanggal"`
	KaryawanID    string `json:"karyawan_id"`
	KaryawanNama  string `json:"karyawan_nama"`
	JenisIjinID   int    `json:"jenis_ijin_id"`
	JenisIjinKode string `json:"jenis_ijin_kode"`
	JenisIjinNama string `json:"jenis_ijin_nama"`
	Keterangan    string `json:"keterangan"`
}
