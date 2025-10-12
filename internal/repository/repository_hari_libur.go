package repository

import (
	"api-presensi/internal/model"
	"time"

	"gorm.io/gorm"
)

type RepositoryHariLibur interface {
	GetHariLibur() ([]model.HariLibur, error)
	GetHariKerjaPerBulan(start, end time.Time) ([]model.HariLibur, error)
	DeleteHariLibur(id int) (model.HariLibur, error)
	CreateHariLibur(hl model.HariLibur) (model.HariLibur, error)
	ExistsByDate(tanggal string) (bool, error)
	UpdateHariLibur(id int, updateMap map[string]any) (model.HariLibur, error)
}

type repositoryHariLibur struct {
	db *gorm.DB
}

func NewRepositoryHariLibur(db *gorm.DB) RepositoryHariLibur {
	return &repositoryHariLibur{db}
}

func (r *repositoryHariLibur) GetHariKerjaPerBulan(start, end time.Time) ([]model.HariLibur, error) {
	var hariLibur []model.HariLibur
	err := r.db.Where("tanggal BETWEEN ? AND ?", start, end).Find(&hariLibur).Error
	return hariLibur, err
}

func (r *repositoryHariLibur) GetHariLibur() ([]model.HariLibur, error) {
	var hariLibur []model.HariLibur
	err := r.db.Find(&hariLibur).Error
	return hariLibur, err
}

func (r *repositoryHariLibur) DeleteHariLibur(id int) (model.HariLibur, error) {
	var hariLibur model.HariLibur

	err := r.db.First(&hariLibur, id).Error
	if err != nil {
		return model.HariLibur{}, err
	}

	err = r.db.Delete(&hariLibur).Error
	if err != nil {
		return model.HariLibur{}, err
	}

	return hariLibur, nil
}

func (r *repositoryHariLibur) CreateHariLibur(newData model.HariLibur) (model.HariLibur, error) {
	err := r.db.Create(&newData).Error
	return newData, err
}

func (r *repositoryHariLibur) ExistsByDate(tanggal string) (bool, error) {
	var hariLibur model.HariLibur
	var count int64
	err := r.db.Where("tanggal = ?", tanggal).First(&hariLibur).Count(&count).Error
	return count > 0, err
}

func (r *repositoryHariLibur) UpdateHariLibur(id int, updateMap map[string]any) (model.HariLibur, error) {
	var hariLibur model.HariLibur
	err := r.db.First(&hariLibur, id).Error
	if err != nil {
		return model.HariLibur{}, err
	}

	err = r.db.Model(&hariLibur).Updates(updateMap).Error
	if err != nil {
		return model.HariLibur{}, err
	}

	return hariLibur, nil
}
