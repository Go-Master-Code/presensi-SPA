package repository

import (
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryJenisIjin interface {
	GetAllJenisIjin() ([]model.JenisIjin, error)
	CreateJenisIjin(jenisIjin model.JenisIjin) (model.JenisIjin, error)
	UpdateJenisIjin(id int, updateMap map[string]any) (model.JenisIjin, error)
	UpdateJenisIjinAktif(id int, aktif bool) (model.JenisIjin, error)
}

// struct implementasi
type repositoryJenisIjin struct {
	db *gorm.DB
}

// constructor
func NewRepositoryJenisIjin(db *gorm.DB) RepositoryJenisIjin {
	return &repositoryJenisIjin{db}
}

// struct method
func (r *repositoryJenisIjin) GetAllJenisIjin() ([]model.JenisIjin, error) {
	var jenisIjin []model.JenisIjin
	err := r.db.Find(&jenisIjin).Error
	return jenisIjin, err
}

func (r *repositoryJenisIjin) CreateJenisIjin(jenisIjin model.JenisIjin) (model.JenisIjin, error) {
	err := r.db.Create(&jenisIjin).Error
	return jenisIjin, err
	// tidak perlu find data lagi karena model = dto
}

func (r *repositoryJenisIjin) UpdateJenisIjin(id int, updateMap map[string]any) (model.JenisIjin, error) {
	// find data dulu
	var jenisIjin model.JenisIjin
	err := r.db.First(&jenisIjin, id).Error
	if err != nil {
		return model.JenisIjin{}, err
	}

	// update data
	err = r.db.Model(&jenisIjin).Updates(updateMap).Error
	if err != nil {
		return model.JenisIjin{}, err
	}

	return jenisIjin, nil

}

func (r *repositoryJenisIjin) UpdateJenisIjinAktif(id int, aktif bool) (model.JenisIjin, error) {
	// first dulu untuk get data
	var jenisIjin model.JenisIjin
	err := r.db.First(&jenisIjin, id).Error
	if err != nil {
		return model.JenisIjin{}, err
	}
	// update atribut aktif bisa jadi false / true
	jenisIjin.Aktif = aktif

	err = r.db.Save(&jenisIjin).Error
	if err != nil {
		return model.JenisIjin{}, err
	}

	// reload data jenisIjin
	err = r.db.First(&jenisIjin).Error
	if err != nil {
		return model.JenisIjin{}, err
	}

	return jenisIjin, nil
}
