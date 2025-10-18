package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
)

type ServiceLog interface {
	CreateLog(log dto.CreateLog) (dto.LogResponse, error)
}

type serviceLog struct {
	repo repository.RepositoryLog
}

func NewServiceLog(repo repository.RepositoryLog) ServiceLog {
	return &serviceLog{repo}
}

func (s *serviceLog) CreateLog(log dto.CreateLog) (dto.LogResponse, error) {
	// convert dto ke model
	req := model.Log{
		UserID:    log.UserID,
		Method:    log.Method,
		Endpoint:  log.Endpoint,
		IPAddress: log.IPAddress,
		UserAgent: log.UserAgent,
	}

	logResult, err := s.repo.CreateLog(req)
	if err != nil {
		return dto.LogResponse{}, err
	}

	// convert model to dto
	logDTO := helper.ConvertToDTOAuditLogSingle(logResult)
	return logDTO, nil
}
