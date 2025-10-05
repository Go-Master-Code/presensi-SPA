package repository

import (
	"api-presensi/internal/model"

	"gorm.io/gorm"
)

type RepositoryUser interface {
	GetAllUser() ([]model.User, error)
	GetUserByID(id int) (model.User, error)
	GetUserLikeByUserName(name string) ([]model.User, error)
	GetUserLikeByEmail(email string) ([]model.User, error)
	DeleteUserByID(id int) (model.User, error)
	CreateUser(user model.User) (model.User, error)
	UpdateUser(id int, updateMap map[string]interface{}) (model.User, error)
}

// struct implementasi
type repositoryUser struct {
	db *gorm.DB
}

// constructor
func NewRepositoryUser(db *gorm.DB) RepositoryUser {
	return &repositoryUser{db}
}

// struct method
func (r *repositoryUser) GetAllUser() ([]model.User, error) {
	var users []model.User
	err := r.db.Preload("Role").Find(&users).Error
	return users, err
}

func (r *repositoryUser) GetUserByID(id int) (model.User, error) {
	var user model.User
	err := r.db.Preload("Role").First(&user, id).Error
	return user, err
}

func (r *repositoryUser) GetUserLikeByUserName(username string) ([]model.User, error) {
	var users []model.User
	err := r.db.Preload("Role").Where("username LIKE ?", "%"+username+"%").Find(&users).Error // cari username yang mengandung karakter name
	return users, err
}

func (r *repositoryUser) GetUserLikeByEmail(email string) ([]model.User, error) {
	var users []model.User
	err := r.db.Preload("Role").Where("email like ?", "%"+email+"%").Find(&users).Error
	return users, err
}

func (r *repositoryUser) DeleteUserByID(id int) (model.User, error) {
	// find data dulu agar bisa ditampilkan di response saat proses delete selesai
	var user model.User

	err := r.db.Preload("Role").First(&user, id).Error
	if err != nil {
		return model.User{}, err
	}

	err = r.db.Delete(&user).Error
	if err != nil {
		return model.User{}, err
	}

	return user, nil
}

func (r *repositoryUser) CreateUser(user model.User) (model.User, error) {
	err := r.db.Create(&user).Error
	if err != nil {
		return model.User{}, err
	}

	// preload role untuk ditampilkan ke response
	err = r.db.Preload("Role").First(&user).Error
	if err != nil {
		return model.User{}, err
	}

	return user, nil
}

func (r *repositoryUser) UpdateUser(id int, updateMap map[string]interface{}) (model.User, error) {
	// cari dulu data usernya
	var user model.User

	err := r.db.First(&user, id).Error
	if err != nil {
		return model.User{}, err
	}

	// untuk menghindari relasi tabel, kosongkan data struct Role yang terhubung dengan struct User ini
	user.Role = model.Role{}

	// lakukan update
	err = r.db.Model(&user).Updates(updateMap).Error
	if err != nil {
		return model.User{}, err
	}

	// reload data + preload struct terkait untuk lihat perubahan
	err = r.db.Preload("Role").First(&user).Error
	if err != nil {
		return model.User{}, err
	}

	return user, nil
}
