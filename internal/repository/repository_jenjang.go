package repository

import (
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryJenjang interface {
	GetAllJenjang() ([]model.Jenjang, error)
}

type repositoryJenjang struct {
	db *gorm.DB
}

func NewRepositoryJenjang(db *gorm.DB) RepositoryJenjang {
	return &repositoryJenjang{db}
}

func (r *repositoryJenjang) GetAllJenjang() ([]model.Jenjang, error) {
	var jenjang []model.Jenjang
	err := r.db.Find(&jenjang).Error
	return jenjang, err
}
