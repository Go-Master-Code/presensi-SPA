package model

import "api-presensi/internal/dto"

// type KehadiranPerKaryawan struct {
// 	KaryawanID uint
// 	Nama       string
// 	Kehadiran  int
// }

type KehadiranReport struct {
	HariKerja int
	Data      []dto.KehadiranResult
}
