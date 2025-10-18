package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claimsVal, exists := c.Get("claims") // ambil context claims yang di set di auth_required.go
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Token claims not found!"})
			c.Abort() // abort berguna agar handler selanjutnya di main.go tidak dieksekusi jika token tidak valid
			return
		}

		claims, ok := claimsVal.(jwt.MapClaims)

		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Token claims not valid"})
			c.Abort() // abort berguna agar handler selanjutnya di main.go tidak dieksekusi jika token tidak valid
			return
		}

		role, ok := claims["role"].(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role tidak ditemukan di token"})
			c.Abort() // abort berguna agar handler selanjutnya di main.go tidak dieksekusi jika token tidak valid
			return
		}

		for _, allowed := range allowedRoles {
			if role == allowed {
				// bisa akses username dan role juga dari sini (mengacu ke var claims line 20)
				username := claims["username"].(string)
				roleList := claims["role"].(string)
				fmt.Println("User:", username, "dengan role:", roleList, "mengakses endpoint ini.")

				c.Next() // lanjut eksekusi handler berikutnya, lihat tiap endpoint di main.go
				return
			}
		}

		// tidak ada context yg bernama "claim"
		c.JSON(http.StatusForbidden, gin.H{"error": "Access rejected, no permission!"})
		c.Abort()
	}
}
