package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/repository"
)

type ServiceRole interface {
	GetAllRole() ([]dto.RoleResponse, error)
}

type serviceRole struct {
	repo repository.RepositoryRole
}

func NewServiceRole(repo repository.RepositoryRole) ServiceRole {
	return &serviceRole{repo}
}

func (s *serviceRole) GetAllRole() ([]dto.RoleResponse, error) {
	roles, err := s.repo.GetAllRole()
	if err != nil {
		return []dto.RoleResponse{}, err
	}

	// convert model to dto
	rolesDTO := helper.ConvertToDTORolePlural(roles)
	return rolesDTO, nil
}
