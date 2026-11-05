/**
 * Konfigurasi Usaha dan Parameter Operasional — Butik Manda
 * Sesuai Standar Operasional Prosedur (SOP) Sistem Penyewaan Statis
 */

export const SHOP_CONFIG = Object.freeze({
  brandName: 'Butik Manda',
  shortName: 'Butik Manda',
  tagline: 'Penyewaan Gaun Pesta dan Dress Elegan Beragam Warna',
  description: 'Pusat sewa busana butik premium untuk wisuda, pesta pernikahan, gala dinner, photoshoot, dan acara istimewa Anda.',
  
  // Nomor WhatsApp resmi usaha (hanya kode negara 62 dan digit murni tanpa +, spasi, tanda hubung, atau 0 di depan)
  // SOP: Nomor WhatsApp usaha memakai kode negara dan digit saja. Jika kosong, pengajuan dinonaktifkan.
  whatsappNumber: '6283116112225',
  whatsappDisplay: '083116112225',
  
  // Informasi Lokasi & Operasional
  address: 'Jl. Melati Indah No. 18, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12160',
  addressNote: 'Tersedia ruang fitting ber-AC dan area parkir.',
  operatingHours: 'Senin – Minggu: 09.00 – 20.00 WIB (Fitting konfirmasi H-1)',
  email: 'devitaamanda906@gmail.com',
  instagram: '@butikmanda.official',
  
  // Parameter Teknis Storage & Keranjang
  storageKey: 'butik-manda:cart:v1',
  schemaVersion: 1,
  minQuantity: 1,
  maxQuantity: 99,
  
  // Kebijakan & Ketentuan Tambahan
  depositInfo: 'Deposit jaminan dan penyesuaian fitting disepakati secara manual saat konfirmasi ketersediaan oleh pengelola butik.',
  pickupInfo: 'Pengambilan dan pengembalian dilakukan langsung di Butik Manda sesuai tanggal yang disepakati.',
  disclaimer: 'Total di website ini merupakan estimasi biaya sewa harian. Pengajuan WhatsApp belum menjadi reservasi resmi sampai dikonfirmasi ketersediaannya oleh pengelola Butik Manda.',
});
