package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
	"errors"
)

type ServiceKaryawan interface {
	GetAllKaryawan() ([]dto.KaryawanResponse, error)
	GetKaryawanByID(id string) (dto.KaryawanResponse, error)
	DeleteKaryawanByID(id string) (dto.KaryawanResponse, error)
	CreateKaryawan(karyawan dto.CreateKaryawanRequest) (dto.KaryawanResponse, error)
	UpdateKaryawan(id string, req dto.UpdateKaryawanRequest) (dto.KaryawanResponse, error)
}

// struct implementasi
type serviceKaryawan struct {
	repo repository.RepositoryKaryawan
}

// constructor
func NewServiceKaryawan(repo repository.RepositoryKaryawan) ServiceKaryawan {
	return &serviceKaryawan{repo}
}

func (s *serviceKaryawan) GetAllKaryawan() ([]dto.KaryawanResponse, error) {
	karyawan, err := s.repo.GetAllKaryawan()
	if err != nil {
		return []dto.KaryawanResponse{}, err
	}

	// convert model to dto
	karyawanDTO := helper.ConvertToDTOKaryawanPlural(karyawan)
	return karyawanDTO, nil
}

func (s *serviceKaryawan) GetKaryawanByID(id string) (dto.KaryawanResponse, error) {
	karyawan, err := s.repo.GetKaryawanByID(id)
	if err != nil {
		return dto.KaryawanResponse{}, err
	}

	// convert model to dto
	karyawanDTO := helper.ConvertToDTOKaryawanSingle(karyawan)
	return karyawanDTO, nil
}

func (s *serviceKaryawan) DeleteKaryawanByID(id string) (dto.KaryawanResponse, error) {
	karyawan, err := s.repo.DeleteKaryawanByID(id)
	if err != nil {
		return dto.KaryawanResponse{}, err
	}

	// convert model to dto
	karyawanDTO := helper.ConvertToDTOKaryawanSingle(karyawan)
	return karyawanDTO, nil
}

func (s *serviceKaryawan) CreateKaryawan(karyawan dto.CreateKaryawanRequest) (dto.KaryawanResponse, error) {
	// cek apakah karyawan sudah ada
	exist := s.repo.ExistsByID(karyawan.ID)

	// cek apakah exist = true
	if exist {
		return dto.KaryawanResponse{}, errors.New("ID karyawan sudah ada")
	}

	req := model.Karyawan{
		ID:        karyawan.ID,
		Nama:      karyawan.Nama,
		JenjangID: karyawan.JenjangID,
		Aktif:     karyawan.Aktif,
	}

	newKaryawan, err := s.repo.CreateKaryawan(req)
	if err != nil {
		return dto.KaryawanResponse{}, err
	}

	// convert model to dto
	newKaryawanDTO := helper.ConvertToDTOKaryawanSingle(newKaryawan)
	return newKaryawanDTO, nil
}

func (s *serviceKaryawan) UpdateKaryawan(id string, req dto.UpdateKaryawanRequest) (dto.KaryawanResponse, error) {
	var updateMap = map[string]any{}

	if req.Nama != nil {
		updateMap["nama"] = *req.Nama // dereference
	}
	if req.JenjangID != nil {
		updateMap["jenjang_id"] = *req.JenjangID // dereference
	}
	if req.Aktif != nil {
		updateMap["aktif"] = *req.Aktif // dereference
	}

	updatedKaryawan, err := s.repo.UpdateKaryawan(id, updateMap)
	if err != nil {
		return dto.KaryawanResponse{}, err
	}

	// convert model to dto
	karyawanDTO := helper.ConvertToDTOKaryawanSingle(updatedKaryawan)
	return karyawanDTO, nil
}
