package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("secret")

// isi: func GenerateToken dan ValidateToken
func GenerateToken(username string, role string) (string, error) {
	//create new token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(time.Hour * 1).Unix(), // harus exp bukan expired
	})
	return token.SignedString(secretKey)
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		return secretKey, nil
	})
}
