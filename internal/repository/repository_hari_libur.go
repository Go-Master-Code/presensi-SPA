package repository

import (
	"api-presensi/internal/model"
	"time"

	"gorm.io/gorm"
)

type RepositoryHariLibur interface {
	GetHariKerjaPerBulan(start, end time.Time) ([]model.HariLibur, error)
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
