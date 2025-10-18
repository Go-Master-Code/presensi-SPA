package dto

type CreateLog struct {
	UserID    *uint  `json:"user_id,omitempty"`
	Method    string `json:"method"`
	Endpoint  string `json:"endpoint"`
	IPAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
}

type LogResponse struct {
	UserID    *uint  `json:"user_id,omitempty"`
	Method    string `json:"method"`
	Endpoint  string `json:"endpoint"`
	IPAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
}
