# Data alamat Indonesia

Checkout memuat wilayah secara bertahap agar data lengkap tidak membebani browser:

1. Provinsi
2. Kabupaten/kota dari provinsi terpilih
3. Kecamatan dari kabupaten/kota terpilih
4. Desa/kelurahan dari kecamatan terpilih

Sumber utama adalah API statis `wilayah.id`, yang memakai data Kepmendagri No. 300.2.2-2138 Tahun 2025: 38 provinsi, 514 kabupaten/kota, 7.285 kecamatan, dan 83.762 desa/kelurahan. Kode wilayah tetap diteruskan ke pesanan untuk validasi.

Pengguna tetap mengisi sendiri nama jalan, nomor rumah, RT/RW, dan lorong. Detail tersebut bukan data administratif publik dan tidak boleh ditebak oleh sistem.

`INDONESIA_REGION_API_URL` bersifat opsional sebagai vendor cadangan. Jika sumber utama atau vendor gagal diakses, aplikasi menampilkan data cadangan yang terbatas agar checkout tidak rusak; pengantaran otomatis hanya tersedia untuk kecamatan yang mempunyai titik pengiriman.
