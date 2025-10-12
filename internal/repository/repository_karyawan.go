package repository

import (
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryKaryawan interface {
	GetAllKaryawan() ([]model.Karyawan, error)
	GetKaryawanByID(id string) (model.Karyawan, error)
	DeleteKaryawanByID(id string) (model.Karyawan, error)
	CreateKaryawan(karyawan model.Karyawan) (model.Karyawan, error)
	ExistsByID(id string) bool
	UpdateKaryawan(id string, updateMap map[string]any) (model.Karyawan, error)
}

// struct implementasi
type repositoryKaryawan struct {
	db *gorm.DB
}

// constructor
func NewRepositoryKaryawan(db *gorm.DB) RepositoryKaryawan {
	return &repositoryKaryawan{db}
}

func (r *repositoryKaryawan) GetAllKaryawan() ([]model.Karyawan, error) {
	var karyawan []model.Karyawan
	err := r.db.Preload("Jenjang").Find(&karyawan).Error
	return karyawan, err
}

func (r *repositoryKaryawan) GetKaryawanByID(id string) (model.Karyawan, error) {
	var karyawan model.Karyawan
	err := r.db.Preload("Jenjang").First(&karyawan, id).Error
	return karyawan, err
}

func (r *repositoryKaryawan) DeleteKaryawanByID(id string) (model.Karyawan, error) {
	var karyawan model.Karyawan
	// get data untuk ditampilkan di response delete
	err := r.db.Preload("Jenjang").First(&karyawan, id).Error
	if err != nil {
		return model.Karyawan{}, err
	}

	err = r.db.Delete(&karyawan).Error
	if err != nil {
		return model.Karyawan{}, err
	}

	return karyawan, nil
}

func (r *repositoryKaryawan) CreateKaryawan(karyawan model.Karyawan) (model.Karyawan, error) {
	err := r.db.Create(&karyawan).Error
	if err != nil {
		return model.Karyawan{}, err
	}

	// preload jenjang untuk ditampilkan ke response
	err = r.db.Preload("Jenjang").First(&karyawan).Error
	if err != nil {
		return model.Karyawan{}, err
	}

	return karyawan, nil
}

func (r *repositoryKaryawan) ExistsByID(id string) bool {
	var karyawan model.Karyawan
	var count int64
	r.db.Where("ID = ?", id).First(&karyawan).Count(&count)
	return count > 0
}

func (r *repositoryKaryawan) UpdateKaryawan(id string, updateMap map[string]interface{}) (model.Karyawan, error) {
	var karyawan model.Karyawan
	err := r.db.First(&karyawan, id).Error
	if err != nil {
		return model.Karyawan{}, err
	}

	// untuk menghindari relasi tabel, kosongkan data struct Jenjang yang terhubung dengan struct Karyawan ini
	karyawan.Jenjang = model.Jenjang{}

	err = r.db.Model(&karyawan).Updates(updateMap).Error
	if err != nil {
		return model.Karyawan{}, err
	}

	// reload data + preload struct terkait untuk lihat perubahan
	err = r.db.Preload("Jenjang").First(&karyawan).Error
	if err != nil {
		return model.Karyawan{}, err
	}

	return karyawan, nil
}
