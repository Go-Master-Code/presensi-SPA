package dto

type CreateKaryawanRequest struct {
	ID        string `json:"id" binding:"required,min=10,max=10"` // UID 10 digit
	Nama      string `json:"nama" binding:"required,max=50"`
	JenjangID int    `json:"jenjang_id" binding:"required"`
	Aktif     bool   `json:"aktif"`
}

type UpdateKaryawanRequest struct {
	// ID    string `json:"id"`
	Nama      *string `json:"nama" binding:"omitempty"`
	JenjangID *int    `json:"jenjang_id" binding:"omitempty"`
	Aktif     *bool   `json:"aktif" binding:"omitempty"`
}

type KaryawanResponse struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	Aktif     bool   `json:"aktif"`
	JenjangID int    `json:"jenjang_id"`
	Jenjang   string `json:"jenjang"`
}
