package repository

import (
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryIjinKaryawan interface {
	GetAllIjinKaryawan() ([]model.IjinKaryawan, error)
	CreateIjinKaryawan(ijin model.IjinKaryawan) (model.IjinKaryawan, error)
	UpdateIjinKaryawan(id int, updateMap map[string]any) (model.IjinKaryawan, error)
}

// struct implementasi
type repositoryIjinKaryawan struct {
	db *gorm.DB
}

// constructor
func NewRepositoryIjinKaryawan(db *gorm.DB) RepositoryIjinKaryawan {
	return &repositoryIjinKaryawan{db}
}

func (r *repositoryIjinKaryawan) GetAllIjinKaryawan() ([]model.IjinKaryawan, error) {
	var ik []model.IjinKaryawan
	err := r.db.Preload("Karyawan").Preload("JenisIjin").Find(&ik).Error
	return ik, err
}

func (r *repositoryIjinKaryawan) CreateIjinKaryawan(ijin model.IjinKaryawan) (model.IjinKaryawan, error) {
	err := r.db.Create(&ijin).Error
	if err != nil {
		return model.IjinKaryawan{}, err
	}

	// preload semua relasi untuk response dto
	err = r.db.Preload("Karyawan").Preload("JenisIjin").First(&ijin).Error
	if err != nil {
		return model.IjinKaryawan{}, err
	}

	return ijin, err
}

func (r *repositoryIjinKaryawan) UpdateIjinKaryawan(id int, updateMap map[string]any) (model.IjinKaryawan, error) {
	// cari dulu datanya
	var ijin model.IjinKaryawan
	err := r.db.First(&ijin, id).Error
	if err != nil {
		return model.IjinKaryawan{}, err
	}

	// untuk menghindari relasi tabel, kosongkan data struct JenisIjin dan Karyawan yang terhubung dengan struct IjinKaryawan ini
	ijin.JenisIjin = model.JenisIjin{}
	ijin.Karyawan = model.Karyawan{}

	err = r.db.Model(&ijin).Updates(updateMap).Error
	if err != nil {
		return model.IjinKaryawan{}, err
	}

	// reload data + preload struct terkait untuk lihat perubahan
	err = r.db.Preload("Karyawan").Preload("JenisIjin").First(&ijin).Error
	if err != nil {
		return model.IjinKaryawan{}, err
	}

	return ijin, nil
}
