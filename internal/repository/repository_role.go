package repository

import (
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryRole interface {
	GetAllRole() ([]model.Role, error)
}

// struct implementasi
type repositoryRole struct {
	db *gorm.DB
}

// constructor
func NewRepositoryRole(db *gorm.DB) RepositoryRole {
	return &repositoryRole{db}
}

// struct method
func (r *repositoryRole) GetAllRole() ([]model.Role, error) {
	var roles []model.Role
	err := r.db.Find(&roles).Error
	return roles, err
}
