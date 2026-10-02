# Laporan Harian — Keuangan & Inventory

Aplikasi standalone untuk mengubah pola buku laporan gudang harian menjadi sistem digital.

## Fungsionalitas yang mengikuti referensi kerja
- **Barang Sisa Bulan Sebelumnya**: saldo awal per barang dan satuan.
- **Barang Gudang Masuk**: tanggal, item, qty, satuan, pihak/supplier, nilai opsional.
- **Barang Gudang Keluar**: tanggal, item, qty, satuan, toko/pelanggan tujuan.
- **Masuk / Pemasukan**: banyak transaksi dalam satu tanggal, kategori, uraian, pihak, nominal.
- **Keluar / Pengeluaran**: banyak transaksi dalam satu tanggal, kategori, uraian, pihak, nominal.
- **Total per tanggal** dan **total periode** otomatis.
- **Total barang masuk/keluar** dan **sisa stok** otomatis.
- **Periode laporan** dapat diganti dengan tanggal dari/sampai.
- **Analisis & Audit** untuk arus kas, pergerakan stok, nilai barang masuk, dan checklist kontrol.
- **Cetak** untuk membuat laporan fisik/PDF melalui print dialog browser.
- Mobile-first dan tetap mudah dipakai seperti buku kerja harian.

## Rumus utama
- Saldo kas = total pemasukan − total pengeluaran.
- Stok akhir = stok awal + barang masuk − barang keluar.
- Nilai persediaan = stok akhir × harga modal.

## Mode saat ini
UI memakai data contoh untuk validasi alur. Belum mengubah database production karena project Supabase baru belum tersedia.

## Production
1. Buat project Supabase baru yang terpisah.
2. Jalankan `supabase/schema.sql`.
3. Tambahkan Auth + role admin/operator dan policy RLS.
4. Hubungkan client Supabase melalui environment variables.
5. Push ke GitHub lalu deploy sebagai project Vercel baru.
6. Jalankan build, smoke test, security/RLS test, dan visual QA sebelum Production.


## Finalisasi QA lokal

- Source mengikuti pola laporan referensi: saldo awal → barang masuk → barang keluar → stok akhir, serta pemasukan → pengeluaran → saldo bersih.
- Data demo dipisahkan dari data production dan tidak terhubung ke R2 NUSANTARA.
- Production wajib mengaktifkan Supabase Auth, role admin/operator, RLS policies, dan audit log sebelum data keuangan nyata dimasukkan.
- Build Production harus dijalankan setelah dependency terpasang dengan `npm ci` lalu `npm run build`.
- Environment variable wajib diisi melalui Vercel/Supabase, bukan disimpan di repository.
- File `package-lock.json` sengaja belum dibuat karena environment eksekusi belum berhasil menyelesaikan instalasi dependency.
