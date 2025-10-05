package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        int            `json:"id" gorm:"primaryKey"`
	Email     string         `json:"email"`
	Username  string         `json:"username"`
	Password  string         `json:"password"`
	RoleID    int            `json:"role_id"`
	Role      Role           `json:"role" gorm:"foreignKey:RoleID;references:ID"` // relasi ke tabel role
	CreatedAt time.Time      `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time      `gorm:"column:updated_at;autoCreateTime;autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at"` //tipe datanya bukan time.Time tapi gorm.DeletedAt -> penanda soft delete
}

func (User) TableName() string {
	return "user"
}
