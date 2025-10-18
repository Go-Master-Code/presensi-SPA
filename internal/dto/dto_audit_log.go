package dto

type CreateLog struct {
	UserID    *string `json:"user_id,omitempty"`
	Method    string  `json:"method"`
	Endpoint  string  `json:"endpoint"`
	IPAddress string  `json:"ip_address"`
	UserAgent string  `json:"user_agent"`
}

type LogResponse struct {
	UserID    *string `json:"user_id,omitempty"`
	Method    string  `json:"method"`
	Endpoint  string  `json:"endpoint"`
	IPAddress string  `json:"ip_address"`
	UserAgent string  `json:"user_agent"`
}
