package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
)

type ServiceUser interface {
	GetAllUser() ([]dto.UserResponse, error)
	GetUserByID(id int) (dto.UserResponse, error)
	GetUserLikeByUserName(name string) ([]dto.UserResponse, error)
	GetUserLikeByEmail(email string) ([]dto.UserResponse, error)
	DeleteUserByID(id int) (dto.UserResponse, error)
	CreateUser(user dto.CreateUserRequest) (dto.UserResponse, error)
	UpdateUser(id int, req dto.UpdateUserRequest) (dto.UserResponse, error)
}

type serviceUser struct {
	repo repository.RepositoryUser
}

func NewServiceUser(repo repository.RepositoryUser) ServiceUser {
	return &serviceUser{repo}
}

func (s *serviceUser) GetAllUser() ([]dto.UserResponse, error) {
	users, err := s.repo.GetAllUser()
	if err != nil {
		// failed fetch data from db
		return nil, err
	}

	// convert model to dto
	usersDTO := helper.ConvertToDTOUserPlural(users)
	return usersDTO, nil
}

func (s *serviceUser) GetUserByID(id int) (dto.UserResponse, error) {
	user, err := s.repo.GetUserByID(id)
	if err != nil {
		return dto.UserResponse{}, err
	}

	// convert model to dto
	userDTO := helper.ConvertToDTOUserSingle(user)
	return userDTO, nil
}

func (s *serviceUser) GetUserLikeByUserName(username string) ([]dto.UserResponse, error) {
	users, err := s.repo.GetUserLikeByUserName(username)
	if err != nil {
		return nil, err
	}

	// convert model to dto
	usersDTO := helper.ConvertToDTOUserPlural(users)
	return usersDTO, nil
}

func (s *serviceUser) GetUserLikeByEmail(email string) ([]dto.UserResponse, error) {
	users, err := s.repo.GetUserLikeByEmail(email)
	if err != nil {
		return nil, err
	}

	// convert model to dto
	usersDTO := helper.ConvertToDTOUserPlural(users)
	return usersDTO, nil
}

func (s *serviceUser) DeleteUserByID(id int) (dto.UserResponse, error) {
	user, err := s.repo.DeleteUserByID(id)
	if err != nil {
		return dto.UserResponse{}, err
	}

	// convert model to dto
	userDTO := helper.ConvertToDTOUserSingle(user)
	return userDTO, nil
}

func (s *serviceUser) CreateUser(user dto.CreateUserRequest) (dto.UserResponse, error) {
	req := model.User{
		Email:    user.Email,
		Username: user.Username,
		Password: user.Password,
		RoleID:   user.RoleID,
	}

	newUser, err := s.repo.CreateUser(req)
	if err != nil {
		return dto.UserResponse{}, err
	}

	// convert model to dto
	newUserDTO := helper.ConvertToDTOUserSingle(newUser)
	return newUserDTO, nil
}

func (s *serviceUser) UpdateUser(id int, req dto.UpdateUserRequest) (dto.UserResponse, error) {
	// new map instance
	var updateMap = map[string]any{}

	if req.Email != nil { // diuji nil karena semua atribut update map adalah pointer
		updateMap["email"] = *req.Email
	}
	if req.Username != nil {
		updateMap["username"] = *req.Username
	}
	if req.Password != nil {
		updateMap["password"] = *req.Password
	}
	if req.RoleID != nil {
		updateMap["role_id"] = *req.RoleID
	}

	updatedUser, err := s.repo.UpdateUser(id, updateMap)
	if err != nil {
		return dto.UserResponse{}, err
	}

	// convert model to dto
	userDTO := helper.ConvertToDTOUserSingle(updatedUser)
	return userDTO, nil
}
