package service

import (
	"api-presensi/internal/repository"
	"time"
)

type ServiceHariKerja interface {
	HitungHariKerja(bulan, tahun int) (int, error)
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
	hariLibur, err := s.repo.GetLiburPerBulan(start, end)
	if err != nil {
		return 0, err
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

	return total, nil
}
