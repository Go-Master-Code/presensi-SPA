package dto

type CreateHariLiburRequest struct {
	// ID         int    `json:"id" binding:"required"`
	Tanggal    string `json:"tanggal" binding:"required"`
	Keterangan string `json:"keterangan" binding:"required"`
}

type UpdateHariLiburRequest struct {
	Tanggal    *string `json:"tanggal" binding:"omitempty"`
	Keterangan *string `json:"keterangan" binding:"omitempty"`
}

type HariLiburResponse struct {
	ID         int    `json:"id"`
	Tanggal    string `json:"tanggal"`
	Hari       string `json:"hari"`
	Keterangan string `json:"keterangan"`
}
