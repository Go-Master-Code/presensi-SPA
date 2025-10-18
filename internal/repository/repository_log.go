package repository

import (
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryLog interface {
	CreateLog(log model.Log) (model.Log, error)
}

type repositoryLog struct {
	db *gorm.DB
}

func NewRepositoryLog(db *gorm.DB) RepositoryLog {
	return &repositoryLog{db}
}

func (r *repositoryLog) CreateLog(log model.Log) (model.Log, error) {
	err := r.db.Create(&log).Error
	return log, err
}
