package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/service"
	"api-presensi/internal/utils/crypto"
	"strconv"

	"github.com/gin-gonic/gin"
)

type handlerUser struct {
	service service.ServiceUser
}

// constructor
func NewHandlerUser(service service.ServiceUser) *handlerUser {
	return &handlerUser{service}
}

// struct method
func (h *handlerUser) GetAllUser(c *gin.Context) {
	users, err := h.service.GetAllUser()
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}
	helper.StatusSuksesGetData(c, users)
}

func (h *handlerUser) GetUserByID(c *gin.Context) {
	// ambil param dari URL
	id := c.Param("id")
	idInt, err := strconv.Atoi(id)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	user, err := h.service.GetUserByID(idInt)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// cek password bcrypt
	// valid := crypto.CheckPassword("pina", "$2a$10$0FeR/jcS6d6TIdPxfViGSeA1/7e4mpllL1d7bf24xF9S2oxy.6WFe")
	// log.Println("Password valid: ", valid)

	helper.StatusSuksesGetData(c, user)
}

func (h *handlerUser) GetUserLikeByUserName(c *gin.Context) {
	username := c.Query("username")
	users, err := h.service.GetUserLikeByUserName(username)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
		return
	}

	// cek apakah ada row yang di return
	if len(users) < 1 {
		helper.ErrorDataNotFound(c)
		return
	}

	helper.StatusSuksesGetData(c, users)
}

func (h *handlerUser) GetUserLikeByEmail(c *gin.Context) {
	email := c.Query("email")
	users, err := h.service.GetUserLikeByEmail(email)
	if err != nil {
		helper.ErrorFetchDataFromDB(c, err)
	}

	// cek apakah ada row yang di return
	if len(users) < 1 {
		helper.ErrorDataNotFound(c)
		return
	}

	helper.StatusSuksesGetData(c, users)
}

func (h *handlerUser) GetUserByQueryParameter(c *gin.Context) {
	// cek apakah ada query parameter email atau username
	email := c.Query("email")
	username := c.Query("username")

	if email != "" {
		h.GetUserLikeByEmail(c)
	} else if username != "" {
		h.GetUserLikeByUserName(c)
	} else {
		helper.ErrorEndpointNotFound(c)
	}
}

func (h *handlerUser) DeleteUserByID(c *gin.Context) {
	id := c.Param("id")
	idInt, err := strconv.Atoi(id)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
	}

	user, err := h.service.DeleteUserByID(idInt)
	// jika data tidak ditemukan
	if user.Email == "" {
		helper.ErrorDataNotFound(c)
		return
	}
	// jika terjadi constraint fails saat delete
	if err != nil {
		helper.ErrorDeleteData(c)
		return
	}

	helper.StatusSuksesDeleteData(c, user)
}

func (h *handlerUser) CreateUser(c *gin.Context) {
	// parsing body json
	var newUser dto.CreateUserRequest
	err := c.ShouldBindJSON(&newUser)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	// hash password bcrypt
	hashPassword, err := crypto.HashPassword(newUser.Password)
	if err != nil {
		helper.ErrorHashingPassword(c, err)
		return
	}

	// ganti password dengan hasil hash
	newUser.Password = hashPassword

	newUserDTO, err := h.service.CreateUser(newUser)
	if err != nil {
		helper.ErrorCreateData(c, err)
		return
	}

	helper.StatusSuksesCreateData(c, newUserDTO)
}

func (h *handlerUser) UpdateUser(c *gin.Context) {
	// parsing body json
	var updateUser dto.UpdateUserRequest
	err := c.ShouldBindJSON(&updateUser)
	if err != nil {
		helper.ErrorParsingRequestBody(c, err)
		return
	}

	// tangkap param id
	id := c.Param("id")
	idInt, err := strconv.Atoi(id)
	if err != nil {
		helper.ErrorParsingAtoi(c, err)
		return
	}

	// hash password bcrypt
	hashPassword, err := crypto.HashPassword(*updateUser.Password)
	if err != nil {
		helper.ErrorHashingPassword(c, err)
		return
	}

	// ganti password dengan hasil hash
	updateUser.Password = &hashPassword

	updateUserDTO, err := h.service.UpdateUser(idInt, updateUser)
	if err != nil {
		helper.ErrorUpdateData(c, err)
		return
	}

	helper.StatusSuksesUpdateData(c, updateUserDTO)
}
