package middleware

import (
	"api-presensi/internal/dto"
	"api-presensi/internal/service"

	"github.com/gin-gonic/gin"
)

func RequestLogger(logService service.ServiceLog) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next() // proses request

		// Filter hanya method tertentu
		switch c.Request.Method {
		case "POST", "PUT", "DELETE": // simpan hanya ketiga method ini agar method lain (yang tidak diperlukan) tidak ikut tersimpan di db
			userID := getUserIDFromContext(c)

			logDTO := dto.CreateLog{
				UserID:    userID,
				Method:    c.Request.Method,
				Endpoint:  c.FullPath(),
				IPAddress: c.ClientIP(),
				UserAgent: c.Request.UserAgent(),
			}

			// simpan log secara asynchronus agar tidak blocking response
			go logService.CreateLog(logDTO)
		}
	}
}

// Mengambil userID dari context (di-set oleh middleware auth)
func getUserIDFromContext(c *gin.Context) *uint {
	userIDValue, exists := c.Get("userID")
	if !exists { // kalo ga ada UserID nya akan disimpan null di db
		return nil
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		return nil
	}

	return &userID
}
