package dto

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,max=50"`
	Username string `json:"username" binding:"required,max=15"`
	Password string `json:"password" binding:"required"`
	RoleID   int    `json:"role_id" binding:"required"`
}

type UpdateUserRequest struct {
	Email    *string `json:"email" binding:"omitempty"`
	Username *string `json:"username" binding:"omitempty"`
	Password *string `json:"password" binding:"omitempty"`
	RoleID   *int    `json:"role_id" binding:"omitempty"`
}

type UserResponse struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	RoleID   int    `json:"role_id"`
	RoleName string `json:"role_name"`
}
