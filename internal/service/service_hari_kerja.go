package service

import (
	"api-presensi/helper"
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
	"errors"
	"time"
)

type ServiceHariKerja interface {
	HitungHariKerja(bulan, tahun int) (int, error)
	GetHariLibur() ([]dto.HariLiburResponse, error)
	DeleteHariLibur(id int) (dto.HariLiburResponse, error)
	CreateHariLibur(hl dto.CreateHariLiburRequest) (dto.HariLiburResponse, error)
	UpdateHariLibur(id int, req dto.UpdateHariLiburRequest) (dto.HariLiburResponse, error)
}

type serviceHariKerja struct {
	repo repository.RepositoryHariLibur
}

func NewServiceHariLibur(repo repository.RepositoryHariLibur) ServiceHariKerja {
	return &serviceHariKerja{repo}
}

func (s *serviceHariKerja) HitungHariKerja(bulan, tahun int) (int, error) {
	// loc := time.FixedZone("WIB", 7*3600) // 7 jam dari UTC
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		panic("gagal load time Asia/Jakarta")
	}

	start := time.Date(tahun, time.Month(bulan), 1, 0, 0, 0, 0, loc) // tanggal awal bulan
	// => 2025-10-01 00:00:00 (Waktu Jakarta)
	end := start.AddDate(0, 1, -1) // tambah 1 bulan kurangi 1 hari (artinya hari terakhir di bulan yang sama)

	// ambil hari libur dari repo
	hariKerja, err := s.repo.GetHariKerjaPerBulan(start, end)
	if err != nil {
		return 0, err
	}

	liburMap := make(map[string]bool)
	for _, h := range hariKerja {
		// iterasi hariLibur, masukkan ke dalam map (key=tanggal, value=true)
		liburMap[h.Tanggal.Format("2006-01-02")] = true
	}

	// Hitung hari kerja (Senin-Jumat, dan bukan hari libur)
	total := 0
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		// d = tgl awal, d <= end, d+=1
		weekday := d.Weekday()
		if weekday >= time.Monday && weekday <= time.Friday { // hari kerja hanya senin-jumat
			if !liburMap[d.Format("2006-01-02")] { // kalau value tanggal di map == false
				// tambah jumlah hari kerja
				total++
			}
		}
	}

	return total, nil
}

func (s *serviceHariKerja) GetHariLibur() ([]dto.HariLiburResponse, error) {
	hariLibur, err := s.repo.GetHariLibur()
	if err != nil {
		return []dto.HariLiburResponse{}, err
	}

	// convert model to dto
	hariLiburDTO := helper.ConvertToDTOHariLiburPlural(hariLibur)
	return hariLiburDTO, nil
}

func (s *serviceHariKerja) DeleteHariLibur(id int) (dto.HariLiburResponse, error) {
	hariLibur, err := s.repo.DeleteHariLibur(id)
	if err != nil {
		return dto.HariLiburResponse{}, err
	}

	// convert model to dto
	hariLiburDTO := helper.ConvertToDTOHariLiburSingle(hariLibur)
	return hariLiburDTO, nil
}

func (s *serviceHariKerja) CreateHariLibur(hl dto.CreateHariLiburRequest) (dto.HariLiburResponse, error) {
	// parsing string ke format time
	tgl, err := time.Parse("2006-01-02", hl.Tanggal) // tanggal di dto request bertipe string
	if err != nil {                                  // jika parsing date gagal
		return dto.HariLiburResponse{}, err
	}

	// cek apa tanggal hari libur sudah ada
	exist, err := s.repo.ExistsByDate(hl.Tanggal)
	if err != nil {
		return dto.HariLiburResponse{}, err
	}

	if exist {
		return dto.HariLiburResponse{}, errors.New("data hari libur sudah ada")
	}

	// convert dto to model
	req := model.HariLibur{
		Tanggal:    tgl, // tanggal yang sudah di convert (bertipe time.Time)
		Keterangan: hl.Keterangan,
	}

	hariLibur, err := s.repo.CreateHariLibur(req)
	if err != nil {
		return dto.HariLiburResponse{}, err
	}

	// convert back to dto
	hariLiburDTO := helper.ConvertToDTOHariLiburSingle(hariLibur)
	return hariLiburDTO, nil
}

func (s *serviceHariKerja) UpdateHariLibur(id int, req dto.UpdateHariLiburRequest) (dto.HariLiburResponse, error) {
	var updateMap = map[string]any{}

	if req.Tanggal != nil {
		updateMap["tanggal"] = *req.Tanggal
	}
	if req.Keterangan != nil {
		updateMap["keterangan"] = *req.Keterangan
	}

	updatedHariLibur, err := s.repo.UpdateHariLibur(id, updateMap)
	if err != nil {
		return dto.HariLiburResponse{}, err
	}

	// convert model to dto
	hariLiburDTO := helper.ConvertToDTOHariLiburSingle(updatedHariLibur)
	return hariLiburDTO, nil
}
