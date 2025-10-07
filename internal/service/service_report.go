package service

import (
	"api-presensi/internal/model"
	"api-presensi/internal/repository"
	"time"
)

type ServiceReport struct {
	RepoHariLibur repository.RepositoryHariLibur
	RepoPresensi  repository.RepositoryPresensi
}

func NewServiceReport(repo1 repository.RepositoryHariLibur, repo2 repository.RepositoryPresensi) *ServiceReport {
	return &ServiceReport{
		RepoHariLibur: repo1,
		RepoPresensi:  repo2,
	}
}

func (s *ServiceReport) GenerateReportKehadiran(bulan, tahun int) (*model.KehadiranReport, error) {
	// loc := time.FixedZone("WIB", 7*3600) // 7 jam dari UTC
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		panic("gagal load time Asia/Jakarta")
	}

	start := time.Date(tahun, time.Month(bulan), 1, 0, 0, 0, 0, loc) // tanggal awal bulan
	// => 2025-10-01 00:00:00 (Waktu Jakarta)
	end := start.AddDate(0, 1, -1) // tambah 1 bulan kurangi 1 hari (artinya hari terakhir di bulan yang sama)

	// ambil hari kerja per bulan
	hariLibur, err := s.RepoHariLibur.GetHariKerjaPerBulan(start, end)
	if err != nil {
		return &model.KehadiranReport{}, err
	}

	liburMap := make(map[string]bool)
	for _, h := range hariLibur {
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

	// ambil data presensi karyawan per bulan
	dataKehadiran, err := s.RepoPresensi.GetPresensiAllPerBulan(bulan, tahun)

	if err != nil {
		return &model.KehadiranReport{}, err
	}

	return &model.KehadiranReport{
		HariKerja: total,
		Data:      dataKehadiran,
	}, nil
}
