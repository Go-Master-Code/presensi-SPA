package dto

import "time"

type CreateHariLibur struct {
	ID         int       `json:"id" binding:"required"`
	Tanggal    time.Time `json:"tanggal" binding:"required"`
	Keterangan string    `json:"keterangan" binding:"required"`
}

type HariLiburResponse struct {
	ID         int       `json:"id"`
	Tanggal    time.Time `json:"tanggal"`
	Keterangan string    `json:"keterangan"`
}
