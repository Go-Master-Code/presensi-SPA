package repository

import (
	"api-presensi/internal/dto"
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryPresensi interface {
	GetAllPresensi() ([]model.Presensi, error)
	GetPresensiByNamaPerHari(nama string, tanggal string) (model.Presensi, error)
	GetPresensiByIdByPeriode(karyawanID string, tanggalAwal string, tanggalAkhir string) ([]model.Presensi, error)
	GetPresensiByIdByBulanTahun(karyawanID string, bulan int, tahun int) ([]model.Presensi, error)
	GetPresensiByBulanTahun(bulan int, tahun int) ([]model.Presensi, error)
	GetPresensiHarian(tanggal string) ([]model.Presensi, error)
	CreatePresensi(presensi model.Presensi) (model.Presensi, error)
	CheckPresensiMasuk(id string, tanggal string) (model.Presensi, error)
	UpdateWaktuPulang(id string, tanggal string, waktuPulang string) (model.Presensi, error)
	GetPresensiAllPerBulan(bulan int, tahun int) ([]dto.KehadiranResult, error) // untuk report presensi semua karyawan per bulan
}

type repositoryPresensi struct {
	db *gorm.DB
}

func NewRepositoryPresensi(db *gorm.DB) RepositoryPresensi {
	return &repositoryPresensi{db}
}

func (r *repositoryPresensi) GetAllPresensi() ([]model.Presensi, error) {
	var presensi []model.Presensi
	err := r.db.Find(&presensi).Error
	return presensi, err
}

func (r *repositoryPresensi) GetPresensiByIdByPeriode(karyawanID string, tanggalAwal string, tanggalAkhir string) ([]model.Presensi, error) {
	var presensi []model.Presensi
	err := r.db.Where("karyawan_id=? and tanggal between ? and ?", karyawanID, tanggalAwal, tanggalAkhir).Find(&presensi).Error
	return presensi, err
}

func (r *repositoryPresensi) GetPresensiByIdByBulanTahun(karyawanID string, bulan int, tahun int) ([]model.Presensi, error) {
	var presensi []model.Presensi
	err := r.db.Preload("Karyawan").Where("karyawan_id=? and MONTH(tanggal) = ? and YEAR(tanggal) = ?", karyawanID, bulan, tahun).Find(&presensi).Error
	return presensi, err
}

func (r *repositoryPresensi) GetPresensiByBulanTahun(bulan int, tahun int) ([]model.Presensi, error) {
	var presensi []model.Presensi
	err := r.db.Preload("Karyawan").Where("MONTH(tanggal) = ? and YEAR(tanggal) = ?", bulan, tahun).Find(&presensi).Error
	return presensi, err
}

func (r *repositoryPresensi) GetPresensiHarian(tanggal string) ([]model.Presensi, error) {
	var presensi []model.Presensi
	err := r.db.Preload("Karyawan").Where("tanggal = ?", tanggal).Find(&presensi).Error
	return presensi, err
}

func (r *repositoryPresensi) CreatePresensi(presensi model.Presensi) (model.Presensi, error) {
	err := r.db.Create(&presensi).Error
	if err != nil {
		return model.Presensi{}, err
	}

	// preload karyawan karena ambil nama dari tabel karyawan
	err = r.db.Preload("Karyawan").Find(&presensi).Error
	if err != nil {
		return model.Presensi{}, err
	}

	return presensi, nil
}

func (r *repositoryPresensi) CheckPresensiMasuk(id string, tanggal string) (model.Presensi, error) {
	var presensi model.Presensi
	err := r.db.Where("karyawan_id = ? and tanggal = ?", id, tanggal).First(&presensi).Error
	return presensi, err
}

func (r *repositoryPresensi) UpdateWaktuPulang(id string, tanggal string, waktuPulang string) (model.Presensi, error) {
	// cari dulu recordnya
	var presensi model.Presensi
	err := r.db.Where("karyawan_id = ? and tanggal = ?", id, tanggal).First(&presensi).Error
	if err != nil {
		return model.Presensi{}, err
	}

	err = r.db.Model(&presensi).Update("waktu_pulang", waktuPulang).Error
	if err != nil {
		return model.Presensi{}, err
	}

	// get data setelah diupdate
	err = r.db.Preload("Karyawan").First(&presensi).Error
	if err != nil {
		return model.Presensi{}, err
	}

	return presensi, err
}

func (r *repositoryPresensi) GetPresensiByNamaPerHari(nama string, tanggal string) (model.Presensi, error) {
	var presensi model.Presensi
	err := r.db.Joins("Karyawan").Where("Karyawan.nama = ? and tanggal = ?", nama, tanggal).First(&presensi).Error
	return presensi, err
}

func (r *repositoryPresensi) GetPresensiAllPerBulan(bulan int, tahun int) ([]dto.KehadiranResult, error) {
	var results []dto.KehadiranResult

	err := r.db.Table("presensi_karyawan AS p").
		Select("p.karyawan_id, k.nama, COUNT(*) AS kehadiran").
		Joins("JOIN karyawan k ON p.karyawan_id = k.id").
		Joins("LEFT JOIN hari_libur l ON p.tanggal = l.tanggal").
		Where("MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ? AND l.tanggal IS NULL AND DAYOFWEEK(p.tanggal) BETWEEN 2 AND 6", bulan, tahun).
		Group("p.karyawan_id, k.nama").
		Scan(&results).Error

	// query DAYOFWEEK(p.tanggal) BETWEEN 2 AND 6 artinya hanya hitung hari senin-jumat

	return results, err
}
