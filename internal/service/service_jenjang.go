package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/repository"
)

type ServiceJenjang interface {
	GetAllJenjang() ([]dto.JenjangResponse, error)
}

type serviceJenjang struct {
	repo repository.RepositoryJenjang
}

func NewServiceJenjang(repo repository.RepositoryJenjang) ServiceJenjang {
	return &serviceJenjang{repo}
}

func (s *serviceJenjang) GetAllJenjang() ([]dto.JenjangResponse, error) {
	jenjang, err := s.repo.GetAllJenjang()
	if err != nil {
		return []dto.JenjangResponse{}, err
	}

	// convert model to dto
	jenjangDTO := helper.ConvertToDTOJenjangPlural(jenjang)
	return jenjangDTO, nil
}
