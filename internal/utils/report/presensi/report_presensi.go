package presensi

import (
	"api-presensi/internal/dto"
	"api-presensi/internal/model"
	"bytes"
	"log"
	"strconv"
	"time"

	"github.com/go-pdf/fpdf"
)

func GenerateReportPresensiAllPerBulan(bulan int, tahun int, report *model.KehadiranReport) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetTitle("Laporan Presensi Karyawan Per Bulan", false)

	// Footer halaman otomatis
	pdf.SetFooterFunc(func() {
		pdf.SetY(-15)
		pdf.SetFont("Arial", "I", 10)
		pdf.CellFormat(0, 10, "Halaman "+strconv.Itoa(pdf.PageNo()), "", 0, "C", false, 0, "")
	})

	pdf.AddPage()

	// add logo
	pdf.Image("internal/utils/report/pf.jpg", 10, 10, 30, 0, false, "", 0, "")

	// Judul
	pdf.SetFont("Arial", "B", 20)

	// beri spasi agar judul bisa sejajar logo
	pdf.Ln(3)
	pdf.CellFormat(0, 10, "Laporan Presensi Karyawan", "", 1, "C", false, 0, "") // judul rata tengah
	pdf.Ln(1)                                                                    // spasi tambahan jika perlu

	// Periode
	pdf.SetFont("Arial", "", 14)

	// nama bulan string
	bulanTime := time.Month(bulan) // harus di convert ke string
	periode := "Bulan " + bulanTime.String() + " Tahun " + strconv.Itoa(tahun)

	// rata tengah
	pdf.CellFormat(0, 6, periode, "", 1, "C", false, 0, "")
	pdf.Ln(2)

	// Jumlah hari aktif
	pdf.SetFont("Arial", "", 14)
	jmlHari := "Jumlah hari kerja: " + strconv.Itoa(report.HariKerja) + " hari"

	// rata tengah
	pdf.CellFormat(0, 6, jmlHari, "", 1, "C", false, 0, "")
	pdf.Ln(2)

	// Geser posisi Y ke bawah agar logo tidak tertimpa judul / tabel
	pdf.SetY(42)

	// Setbackground color dan font color header
	pdf.SetFillColor(255, 140, 60)  // Latar belakang orange (misalnya)
	pdf.SetTextColor(255, 255, 255) // Teks putih
	pdf.SetDrawColor(0, 0, 0)       // Border hitam

	// Header Tabel
	pdf.SetFont("Arial", "B", 12)
	headers := []string{"ID", "Nama", "Jumlah Hadir", "Tidak Hadir"} // judul header
	widths := []float64{32, 73, 32, 32}                              // width masing-masing kolom
	aligns := []string{"C", "L", "C", "C"}                           // text-alignment masing-masing kolom

	for i, str := range headers {
		pdf.CellFormat(widths[i], 10, str, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)

	// Isi Tabel
	pdf.SetTextColor(0, 0, 0) // Supaya isi tabel kembali teks hitam
	pdf.SetFont("Arial", "", 12)

	// jumlah karyawan
	jmlKaryawan := 0

	for _, presensi := range report.Data {
		row := []string{
			// nomor row
			presensi.KaryawanID,
			presensi.Nama,
			strconv.Itoa(presensi.Kehadiran),
			strconv.Itoa(report.HariKerja - presensi.Kehadiran),
		}

		for j, str := range row {
			pdf.CellFormat(widths[j], 10, str, "1", 0, aligns[j], false, 0, "") // C = Center
		}

		// tambah counter jmlKaryawan
		jmlKaryawan += 1

		pdf.Ln(-1)
	}

	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(widths[0]+widths[1]+widths[2], 10, "Total Karyawan:", "1", 0, "R", false, 0, "")
	pdf.CellFormat(widths[3], 10, strconv.Itoa(jmlKaryawan)+" orang", "1", 0, "C", false, 0, "")
	pdf.Ln(-1)

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func GenerateReportPresensiAllPerPeriode(awal, akhir string, report *model.KehadiranReport) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetTitle("Laporan Presensi Karyawan Per Periode", false)

	// Footer halaman otomatis
	pdf.SetFooterFunc(func() {
		pdf.SetY(-15)
		pdf.SetFont("Arial", "I", 10)
		pdf.CellFormat(0, 10, "Halaman "+strconv.Itoa(pdf.PageNo()), "", 0, "C", false, 0, "")
	})

	pdf.AddPage()

	// add logo
	pdf.Image("internal/utils/report/pf.jpg", 10, 10, 30, 0, false, "", 0, "")

	// Judul
	pdf.SetFont("Arial", "B", 20)

	// beri spasi agar judul bisa sejajar logo
	pdf.Ln(3)
	pdf.CellFormat(0, 10, "Laporan Presensi Karyawan", "", 1, "C", false, 0, "") // judul rata tengah
	pdf.Ln(1)                                                                    // spasi tambahan jika perlu

	// Periode
	pdf.SetFont("Arial", "", 14)

	// nama bulan string
	periode := "Dari " + awal + " Sampai " + akhir

	// rata tengah
	pdf.CellFormat(0, 6, periode, "", 1, "C", false, 0, "")
	pdf.Ln(2)

	// Jumlah hari aktif
	pdf.SetFont("Arial", "", 14)
	jmlHari := "Jumlah hari kerja: " + strconv.Itoa(report.HariKerja) + " hari"

	// rata tengah
	pdf.CellFormat(0, 6, jmlHari, "", 1, "C", false, 0, "")
	pdf.Ln(2)

	// Geser posisi Y ke bawah agar logo tidak tertimpa judul / tabel
	pdf.SetY(42)

	// Setbackground color dan font color header
	pdf.SetFillColor(255, 140, 60)  // Latar belakang orange (misalnya)
	pdf.SetTextColor(255, 255, 255) // Teks putih
	pdf.SetDrawColor(0, 0, 0)       // Border hitam

	// Header Tabel
	pdf.SetFont("Arial", "B", 12)
	headers := []string{"ID", "Nama", "Jumlah Hadir", "Tidak Hadir"} // judul header
	widths := []float64{32, 73, 32, 32}                              // width masing-masing kolom
	aligns := []string{"C", "L", "C", "C"}                           // text-alignment masing-masing kolom

	for i, str := range headers {
		pdf.CellFormat(widths[i], 10, str, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)

	// Isi Tabel
	pdf.SetTextColor(0, 0, 0) // Supaya isi tabel kembali teks hitam
	pdf.SetFont("Arial", "", 12)

	// jumlah karyawan
	jmlKaryawan := 0

	for _, presensi := range report.Data {
		row := []string{
			// nomor row
			presensi.KaryawanID,
			presensi.Nama,
			strconv.Itoa(presensi.Kehadiran),
			strconv.Itoa(report.HariKerja - presensi.Kehadiran),
		}

		for j, str := range row {
			pdf.CellFormat(widths[j], 10, str, "1", 0, aligns[j], false, 0, "") // C = Center
		}

		// tambah counter jmlKaryawan
		jmlKaryawan += 1

		pdf.Ln(-1)
	}

	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(widths[0]+widths[1]+widths[2], 10, "Total Karyawan:", "1", 0, "R", false, 0, "")
	pdf.CellFormat(widths[3], 10, strconv.Itoa(jmlKaryawan)+" orang", "1", 0, "C", false, 0, "")
	pdf.Ln(-1)

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func GenerateReportPresensiPerKaryawanPerPeriode(awal, akhir string, report []dto.PresensiResponse) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetTitle("Laporan Presensi Karyawan "+report[0].KaryawanNama, false)

	// Footer halaman otomatis
	pdf.SetFooterFunc(func() {
		pdf.SetY(-15)
		pdf.SetFont("Arial", "I", 10)
		pdf.CellFormat(0, 10, "Halaman "+strconv.Itoa(pdf.PageNo()), "", 0, "C", false, 0, "")
	})

	pdf.AddPage()

	// add logo
	pdf.Image("internal/utils/report/pf.jpg", 10, 10, 30, 0, false, "", 0, "")

	// Judul
	pdf.SetFont("Arial", "B", 20)

	// beri spasi agar judul bisa sejajar logo
	pdf.Ln(3)
	pdf.CellFormat(0, 10, "Laporan Presensi Karyawan "+report[0].KaryawanNama, "", 1, "C", false, 0, "") // judul rata tengah
	pdf.Ln(1)                                                                                            // spasi tambahan jika perlu

	// Periode
	pdf.SetFont("Arial", "", 14)

	// nama bulan string
	periode := "Dari " + awal + " Sampai " + akhir

	// rata tengah
	pdf.CellFormat(0, 6, periode, "", 1, "C", false, 0, "")
	pdf.Ln(2)

	// // Jumlah hari aktif
	// pdf.SetFont("Arial", "", 14)
	// jmlHari := "Jumlah hari kerja: " + strconv.Itoa(report.HariKerja) + " hari"

	// rata tengah
	// pdf.CellFormat(0, 6, jmlHari, "", 1, "C", false, 0, "")
	// pdf.Ln(2)

	// Geser posisi Y ke bawah agar logo tidak tertimpa judul / tabel
	pdf.SetY(42)

	// Setbackground color dan font color header
	pdf.SetFillColor(255, 140, 60)  // Latar belakang orange (misalnya)
	pdf.SetTextColor(255, 255, 255) // Teks putih
	pdf.SetDrawColor(0, 0, 0)       // Border hitam

	// Header Tabel
	pdf.SetFont("Arial", "B", 12)
	headers := []string{"Tanggal", "Jam Masuk", "Status", "Jam Pulang", "Keterangan"} // judul header
	widths := []float64{32, 32, 32, 32, 62}                                           // width masing-masing kolom
	aligns := []string{"C", "C", "C", "C", "L"}                                       // text-alignment masing-masing kolom

	for i, str := range headers {
		pdf.CellFormat(widths[i], 10, str, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)

	// Isi Tabel
	pdf.SetTextColor(0, 0, 0) // Supaya isi tabel kembali teks hitam
	pdf.SetFont("Arial", "", 12)

	// jumlah karyawan
	jmlHari := 0

	// layout waktu untuk cek terlambat
	layout := "15:04:05" // Format jam dalam 24 jam

	batas, err := time.Parse(layout, "07:00:00")
	if err != nil {
		log.Println("Gagal parsing waktu:", err)
		return []byte{}, err
	}

	var terlambat string

	for _, presensi := range report {
		// logika apakah karyawan terlambat atau tidak
		jamMasuk, err := time.Parse(layout, presensi.WaktuMasuk)
		if err != nil {
			log.Println("Gagal parsing waktu:", err)
			return []byte{}, err
		}

		// pengecekan apakah jam masuk lebih dari batas (07:00:00)
		if jamMasuk.After(batas) {
			terlambat = "Terlambat"
		} else {
			terlambat = "-"
		}

		row := []string{
			// nomor row
			presensi.Tanggal,
			presensi.WaktuMasuk,
			terlambat,
			presensi.WaktuPulang,
			presensi.Keterangan,
		}

		for j, str := range row {
			// Jika kolom ke-2 (indeks 2) dan isinya "Terlambat", beri warna merah
			if j == 2 && str == "Terlambat" {
				pdf.SetTextColor(255, 0, 0) // Merah
			} else {
				pdf.SetTextColor(0, 0, 0) // Hitam
			}
			pdf.CellFormat(widths[j], 10, str, "1", 0, aligns[j], false, 0, "") // C = Center
		}

		// tambah counter jmlHari
		jmlHari += 1

		pdf.Ln(-1)
	}

	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(widths[0]+widths[1]+widths[2], 10, "Total Hari Masuk:", "1", 0, "R", false, 0, "")
	pdf.CellFormat(widths[3], 10, strconv.Itoa(jmlHari)+" hari", "1", 0, "C", false, 0, "")
	pdf.Ln(-1)

	var buf bytes.Buffer
	err = pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
