package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
	"time"
)

type ServiceIjinKaryawan interface {
	GetAllIjinKaryawan() ([]dto.IjinKaryawanResponse, error)
	CreateIjinKaryawan(ijin dto.CreateIjinKaryawanRequest) (dto.IjinKaryawanResponse, error)
	UpdateIjinKaryawan(id int, req dto.UpdateIjinKaryawanRequest) (dto.IjinKaryawanResponse, error)
}

// struct implementasi
type serviceIjinKaryawan struct {
	repo repository.RepositoryIjinKaryawan
}

// constructor
func NewServiceIjinKaryawan(repo repository.RepositoryIjinKaryawan) ServiceIjinKaryawan {
	return &serviceIjinKaryawan{repo}
}

func (s *serviceIjinKaryawan) GetAllIjinKaryawan() ([]dto.IjinKaryawanResponse, error) {
	ijin, err := s.repo.GetAllIjinKaryawan()
	if err != nil {
		return []dto.IjinKaryawanResponse{}, err
	}

	// convert model to dto
	ijinDTO := helper.ConvertToDTOIjinKaryawanPlural(ijin)
	return ijinDTO, nil
}

func (s *serviceIjinKaryawan) CreateIjinKaryawan(ijin dto.CreateIjinKaryawanRequest) (dto.IjinKaryawanResponse, error) {
	// convert tanggal
	tgl, err := time.Parse("2006-01-02", ijin.Tanggal)
	if err != nil {
		return dto.IjinKaryawanResponse{}, err
	}

	// convert dto ke model
	req := model.IjinKaryawan{
		Tanggal:     tgl, // tanggal yang sudah di convert (bertipe time.Time)
		KaryawanID:  ijin.KaryawanID,
		JenisIjinID: ijin.JenisIjinID,
		Keterangan:  ijin.Keterangan,
	}

	ijinKaryawan, err := s.repo.CreateIjinKaryawan(req)
	if err != nil {
		return dto.IjinKaryawanResponse{}, err
	}

	// convert model to dto
	ijinKaryawanDTO := helper.ConvertToDTOIjinKaryawanSingle(ijinKaryawan)

	return ijinKaryawanDTO, nil
}

func (s *serviceIjinKaryawan) UpdateIjinKaryawan(id int, req dto.UpdateIjinKaryawanRequest) (dto.IjinKaryawanResponse, error) {
	// var map untuk tampung data req
	var updateMap = map[string]any{}

	if req.Tanggal != nil {
		updateMap["tanggal"] = *req.Tanggal
	}
	if req.KaryawanID != nil {
		updateMap["karyawan_id"] = *req.KaryawanID
	}
	if req.JenisIjinID != nil {
		updateMap["jenis_ijin_id"] = *req.JenisIjinID
	}
	if req.Keterangan != nil {
		updateMap["keterangan"] = *req.Keterangan
	}

	updatedIjin, err := s.repo.UpdateIjinKaryawan(id, updateMap)
	if err != nil {
		return dto.IjinKaryawanResponse{}, err
	}

	// convert to dto
	ijinDTO := helper.ConvertToDTOIjinKaryawanSingle(updatedIjin)

	return ijinDTO, nil
}
