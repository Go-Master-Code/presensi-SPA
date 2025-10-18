package middleware

import (
	"api-presensi/internal/auth"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" || !strings.HasPrefix(tokenString, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak ada atau tidak valid!"})
			c.Abort()
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ") // menghilangkan suatu prefix / suatu string dari suatu string utuh

		token, err := auth.ValidateToken(tokenString)
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid!"})
			c.Abort() // abort berguna agar handler selanjutnya tidak dieksekusi jika token tidak valid
			// contoh: handler GetItemById() tidak boleh dijalankan jika token tidak valid
			return
		}

		// tambahan untuk RBAC (Role Based Access Control)
		/*
			Masalah utama:
			Saat token sudah valid, kita harus menyimpan informasi claims ke dalam context.
			RBAC (dan handler) perlu akses ke role user di dalam JWT.
		*/

		// ambil dan simpan claims ke context
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			c.Set("claims", claims) // bisa akses "role", "username", dsb dari middleware lain
			username := claims["username"].(string)
			c.Set("username", username)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token claims tidak valid!"})
			c.Abort()
			return
		}

		// jika token valid
		c.Next()
	}
}
