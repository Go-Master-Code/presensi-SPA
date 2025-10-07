package helper

import (
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
)

func ConvertToDTOUserPlural(users []model.User) []dto.UserResponse {
	// tampung data dto
	var usersDTO []dto.UserResponse
	for _, u := range users {
		usersDTO = append(usersDTO, dto.UserResponse{
			ID:       u.ID,
			Email:    u.Email,
			Username: u.Username,
			RoleID:   u.RoleID,
			RoleName: u.Role.Nama,
		})
	}
	return usersDTO
}

func ConvertToDTOUserSingle(user model.User) dto.UserResponse {
	var userDTO dto.UserResponse
	userDTO.ID = user.ID
	userDTO.Email = user.Email
	userDTO.Username = user.Username
	userDTO.RoleID = user.RoleID
	userDTO.RoleName = user.Role.Nama
	return userDTO
}

func ConvertToDTOKaryawanPlural(karyawan []model.Karyawan) []dto.KaryawanResponse {
	var karyawanDTO []dto.KaryawanResponse
	for _, k := range karyawan {
		karyawanDTO = append(karyawanDTO, dto.KaryawanResponse{
			ID:        k.ID,
			Nama:      k.Nama,
			JenjangID: k.JenjangID,
			Jenjang:   k.Jenjang.Nama,
			Aktif:     k.Aktif,
			CreatedAt: k.CreatedAt,
		})
	}
	return karyawanDTO
}

func ConvertToDTOKaryawanSingle(karyawan model.Karyawan) dto.KaryawanResponse {
	var karyawanDTO dto.KaryawanResponse
	karyawanDTO.ID = karyawan.ID
	karyawanDTO.Nama = karyawan.Nama
	karyawanDTO.JenjangID = karyawan.JenjangID
	karyawanDTO.Jenjang = karyawan.Jenjang.Nama
	karyawanDTO.Aktif = karyawan.Aktif
	karyawanDTO.CreatedAt = karyawan.CreatedAt
	return karyawanDTO
}

func ConvertToDTOJenisIjinPlural(jenisIjin []model.JenisIjin) []dto.JenisIjinResponse {
	var jenisIjinDTO []dto.JenisIjinResponse
	for _, j := range jenisIjin {
		jenisIjinDTO = append(jenisIjinDTO, dto.JenisIjinResponse{
			ID:    j.ID,
			Kode:  j.Kode,
			Nama:  j.Nama,
			Aktif: j.Aktif,
		})
	}
	return jenisIjinDTO
}

func ConvertToDTOJenisIjinSingle(jenisIjin model.JenisIjin) dto.JenisIjinResponse {
	var jenisIjinDTO dto.JenisIjinResponse
	jenisIjinDTO.ID = jenisIjin.ID
	jenisIjinDTO.Kode = jenisIjin.Kode
	jenisIjinDTO.Nama = jenisIjin.Nama
	jenisIjinDTO.Aktif = jenisIjin.Aktif
	return jenisIjinDTO
}

func ConvertToDTOPresensiPlural(presensi []model.Presensi) []dto.PresensiResponse {
	var presensiDTO []dto.PresensiResponse
	for _, p := range presensi {
		presensiDTO = append(presensiDTO, dto.PresensiResponse{
			ID:           p.ID,
			KaryawanID:   p.KaryawanID,
			KaryawanNama: p.Karyawan.Nama,
			Tanggal:      p.Tanggal.Format("2006-01-02"), // parsing format tanggal
			WaktuMasuk:   p.WaktuMasuk,                   // parsing format waktu
			WaktuPulang:  p.WaktuPulang,                  // parsing format waktu
			Keterangan:   p.Keterangan,
		})
	}
	return presensiDTO
}

func ConvertToDTOPresensiSingle(presensi model.Presensi) dto.PresensiResponse {
	var presensiDTO dto.PresensiResponse
	presensiDTO.ID = presensi.ID
	presensiDTO.KaryawanID = presensi.KaryawanID
	presensiDTO.KaryawanNama = presensi.Karyawan.Nama
	presensiDTO.Tanggal = presensi.Tanggal.Format("2006-01-02")
	presensiDTO.WaktuMasuk = presensi.WaktuMasuk
	presensiDTO.WaktuPulang = presensi.WaktuPulang
	presensiDTO.Keterangan = presensi.Keterangan
	return presensiDTO
}

func ConvertToDTOHariLiburSingle(hariLibur model.HariLibur) dto.HariLiburResponse {
	var hariLiburDTO dto.HariLiburResponse
	hariLiburDTO.ID = hariLibur.ID
	hariLiburDTO.Tanggal = hariLibur.Tanggal
	hariLiburDTO.Keterangan = hariLibur.Keterangan
	return hariLiburDTO
}

func ConvertToDTOHariLiburPlural(hariLibur []model.HariLibur) []dto.HariLiburResponse {
	var hariLiburDTO []dto.HariLiburResponse
	for _, h := range hariLibur {
		hariLiburDTO = append(hariLiburDTO, dto.HariLiburResponse{
			ID:         h.ID,
			Tanggal:    h.Tanggal,
			Keterangan: h.Keterangan,
		})
	}
	return hariLiburDTO
}

func ConvertToDTOJenjangPlural(jenjang []model.Jenjang) []dto.JenjangResponse {
	var jenjangDTO []dto.JenjangResponse
	for _, j := range jenjang {
		jenjangDTO = append(jenjangDTO, dto.JenjangResponse{
			ID:   j.ID,
			Nama: j.Nama,
		})
	}
	return jenjangDTO
}
