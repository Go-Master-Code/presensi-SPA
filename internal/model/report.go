package model

import "api-presensi/internal/dto"

type KehadiranReport struct {
	HariKerja int                   `json:"hari_kerja"`
	Data      []dto.KehadiranResult `json:"data"`
}
