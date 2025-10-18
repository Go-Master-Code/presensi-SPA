package handler

import (
	"api-presensi/helper"
	"api-presensi/internal/auth"
	"api-presensi/internal/database"
	"api-presensi/internal/model"
	"api-presensi/internal/utils/crypto"

	"github.com/gin-gonic/gin"
)

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input LoginInput

		// bind request body
		err := c.ShouldBindJSON(&input)
		if err != nil {
			helper.ErrorParsingRequestBody(c, err)
			return
		}

		// sumber data login dari db
		var user model.User
		err = database.DB.Where("username = ?", input.Username).First(&user).Error
		if err != nil {
			helper.ErrorDataNotFound(c)
			return
		}

		// CheckPassword(plain text, password di DB) -> input.Password adalah plain text dari request body user
		valid := crypto.CheckPassword(input.Password, user.Password)

		// DEBUG input password user dan password db
		// log.Println("password IN: " + input.Password)
		// log.Println("password DB: " + user.Password)

		if valid {
			// jika username ada dan password sama
			token, err := auth.GenerateToken(user.Username, user.Role.Nama)

			if err != nil {
				helper.ErrorGenerateToken(c, err)
				return
			}

			helper.StatusSuksesGetData(c, token)
		} else { // jika password salah
			helper.ErrorWrongPassword(c)
		}
	}
}
