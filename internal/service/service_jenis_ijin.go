package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
)

type ServiceJenisIjin interface {
	GetAllJenisIjin() ([]dto.JenisIjinResponse, error)
	CreateJenisIjin(jenisIjin dto.CreateJenisIjinRequest) (dto.JenisIjinResponse, error)
	UpdateJenisIjin(id int, req dto.UpdateJenisIjinRequest) (dto.JenisIjinResponse, error)
	UpdateJenisIjinAktif(id int, aktif bool) (dto.JenisIjinResponse, error)
}

// struct implementasi
type serviceJenisIjin struct {
	repo repository.RepositoryJenisIjin
}

// constructor
func NewServiceJenisIjin(repo repository.RepositoryJenisIjin) ServiceJenisIjin {
	return &serviceJenisIjin{repo}
}

// struct method
func (s *serviceJenisIjin) GetAllJenisIjin() ([]dto.JenisIjinResponse, error) {
	jenisIjin, err := s.repo.GetAllJenisIjin()
	if err != nil {
		return []dto.JenisIjinResponse{}, err
	}

	// convert model to dto
	jenisIjinDTO := helper.ConvertToDTOJenisIjinPlural(jenisIjin)
	return jenisIjinDTO, nil
}

func (s *serviceJenisIjin) CreateJenisIjin(jenisIjin dto.CreateJenisIjinRequest) (dto.JenisIjinResponse, error) {
	// convert dto to model
	var req model.JenisIjin
	req.Kode = jenisIjin.Kode
	req.Nama = jenisIjin.Nama
	req.Aktif = true // default value untuk aktif

	newJenisIjin, err := s.repo.CreateJenisIjin(req)
	if err != nil {
		return dto.JenisIjinResponse{}, err
	}

	// convert model to dto
	newJenisIjinDTO := helper.ConvertToDTOJenisIjinSingle(newJenisIjin)
	return newJenisIjinDTO, nil
}

func (s *serviceJenisIjin) UpdateJenisIjin(id int, req dto.UpdateJenisIjinRequest) (dto.JenisIjinResponse, error) {
	// inisiasi map
	var updateMap = map[string]any{}
	if req.Kode != nil {
		updateMap["kode"] = req.Kode
	}
	if req.Nama != nil {
		updateMap["nama"] = req.Nama
	}
	if req.Aktif != nil {
		updateMap["aktif"] = req.Aktif
	}

	updatedJenisIjin, err := s.repo.UpdateJenisIjin(id, updateMap)
	if err != nil {
		return dto.JenisIjinResponse{}, err
	}

	// convert model to dto
	jenisIjinDTO := helper.ConvertToDTOJenisIjinSingle(updatedJenisIjin)

	return jenisIjinDTO, nil
}

func (s *serviceJenisIjin) UpdateJenisIjinAktif(id int, aktif bool) (dto.JenisIjinResponse, error) {
	jenisIjin, err := s.repo.UpdateJenisIjinAktif(id, aktif)
	if err != nil {
		return dto.JenisIjinResponse{}, err
	}

	// convert model to dto
	jenisIjinDTO := helper.ConvertToDTOJenisIjinSingle(jenisIjin)
	return jenisIjinDTO, nil
}
