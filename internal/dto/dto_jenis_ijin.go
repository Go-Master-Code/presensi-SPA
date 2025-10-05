package dto

type CreateJenisIjinRequest struct {
	Kode  string `json:"kode" binding:"required,max=20"`
	Nama  string `json:"nama" binding:"required,max=50"`
	Aktif bool   `json:"aktif"`
}

type UpdateJenisIjinRequest struct {
	Kode  *string `json:"kode" binding:"omitempty"`
	Nama  *string `json:"nama" binding:"omitempty"`
	Aktif *bool   `json:"aktif" binding:"omitempty"`
}

type JenisIjinResponse struct {
	ID    int    `json:"id"`
	Kode  string `json:"kode"`
	Nama  string `json:"nama"`
	Aktif bool   `json:"aktif"`
}
