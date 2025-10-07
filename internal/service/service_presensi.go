package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
	"time"
)

type ServicePresensi interface {
	GetAllPresensi() ([]dto.PresensiResponse, error)
	GetPresensiByNamaPerHari(nama string, tanggal string) (dto.PresensiResponse, error)
	GetPresensiByIdByPeriode(karyawanID string, tanggalAwal string, tanggalAkhir string) ([]dto.PresensiResponse, error)
	GetPresensiByIdByBulanTahun(karyawanID string, bulan int, tahun int) ([]dto.PresensiResponse, error)
	GetPresensiByBulanTahun(bulan int, tahun int) ([]dto.PresensiResponse, error)
	GetPresensiHarian(tanggal string) ([]dto.PresensiResponse, error)
	CreateOrUpdatePresensi(presensi dto.CreatePresensiRequest) (dto.PresensiResponse, error)
	GetPresensiAllPerBulan(bulan int, tahun int) ([]dto.KehadiranResult, error)
}

type servicePresensi struct {
	repo repository.RepositoryPresensi
}

func NewServicePresensi(repo repository.RepositoryPresensi) ServicePresensi {
	return &servicePresensi{repo}
}

func (s *servicePresensi) GetAllPresensi() ([]dto.PresensiResponse, error) {
	presensi, err := s.repo.GetAllPresensi()
	if err != nil {
		return []dto.PresensiResponse{}, err
	}

	// convert model to dto
	presensiDTO := helper.ConvertToDTOPresensiPlural(presensi)
	return presensiDTO, nil
}

func (s *servicePresensi) GetPresensiByIdByPeriode(karyawanID string, tanggalAwal string, tanggalAkhir string) ([]dto.PresensiResponse, error) {
	presensi, err := s.repo.GetPresensiByIdByPeriode(karyawanID, tanggalAwal, tanggalAkhir)
	if err != nil {
		return []dto.PresensiResponse{}, err
	}

	// convert model to dto
	presensiDTO := helper.ConvertToDTOPresensiPlural(presensi)
	return presensiDTO, nil
}

func (s *servicePresensi) GetPresensiByIdByBulanTahun(karyawanID string, bulan int, tahun int) ([]dto.PresensiResponse, error) {
	presensi, err := s.repo.GetPresensiByIdByBulanTahun(karyawanID, bulan, tahun)
	if err != nil {
		return []dto.PresensiResponse{}, err
	}

	// convert model to dto
	presensiDTO := helper.ConvertToDTOPresensiPlural(presensi)
	return presensiDTO, nil
}

func (s *servicePresensi) GetPresensiByBulanTahun(bulan int, tahun int) ([]dto.PresensiResponse, error) {
	presensi, err := s.repo.GetPresensiByBulanTahun(bulan, tahun)
	if err != nil {
		return []dto.PresensiResponse{}, err
	}

	// convert model to dto
	presensiDTO := helper.ConvertToDTOPresensiPlural(presensi)
	return presensiDTO, nil
}

func (s *servicePresensi) GetPresensiHarian(tanggal string) ([]dto.PresensiResponse, error) {
	presensi, err := s.repo.GetPresensiHarian(tanggal)
	if err != nil {
		return []dto.PresensiResponse{}, err
	}

	// convert model to dto
	presensiDTO := helper.ConvertToDTOPresensiPlural(presensi)
	return presensiDTO, nil
}

func (s *servicePresensi) CreateOrUpdatePresensi(presensi dto.CreatePresensiRequest) (dto.PresensiResponse, error) {
	// cek apakah absensi di hari itu sudah ada
	data, _ := s.repo.CheckPresensiMasuk(presensi.KaryawanID, presensi.Tanggal)

	var req model.Presensi

	req.KaryawanID = presensi.KaryawanID
	// parse tanggal
	tglTime, err := time.Parse("2006-01-02", presensi.Tanggal)
	if err != nil {
		return dto.PresensiResponse{}, err
	}

	req.Tanggal = tglTime

	// cek apakah ada data absensi masuk seorang karyawan di tgl itu, jika belum ada, insert data
	if data.KaryawanID == "" {
		// data absen di hari itu belum ada, lakukan insert data

		req.WaktuMasuk = presensi.WaktuMasuk
		req.WaktuPulang = presensi.WaktuMasuk
		// req.Keterangan = presensi.Keterangan

		newPresensi, err := s.repo.CreatePresensi(req)
		if err != nil {
			return dto.PresensiResponse{}, err
		}

		// convert model to dto
		presensiDTO := helper.ConvertToDTOPresensiSingle(newPresensi)
		return presensiDTO, nil
	} else {
		// ambil data waktu pulang
		req.WaktuPulang = presensi.WaktuPulang
		updatePresensi, err := s.repo.UpdateWaktuPulang(req.KaryawanID, presensi.Tanggal, req.WaktuPulang)
		if err != nil {
			return dto.PresensiResponse{}, err
		}

		// convert model to dto
		presensiUpdateDTO := helper.ConvertToDTOPresensiSingle(updatePresensi)
		return presensiUpdateDTO, nil
	}
}

func (s *servicePresensi) GetPresensiByNamaPerHari(nama string, tanggal string) (dto.PresensiResponse, error) {
	presensi, err := s.repo.GetPresensiByNamaPerHari(nama, tanggal)
	if err != nil {
		return dto.PresensiResponse{}, err
	}

	// convert model to dto
	presensiDTO := helper.ConvertToDTOPresensiSingle(presensi)
	return presensiDTO, nil
}

func (s *servicePresensi) GetPresensiAllPerBulan(bulan int, tahun int) ([]dto.KehadiranResult, error) {
	results, err := s.repo.GetPresensiAllPerBulan(bulan, tahun)
	if err != nil {
		return []dto.KehadiranResult{}, err
	}

	return results, nil
}
