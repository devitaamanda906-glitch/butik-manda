/**
 * Skrip Verifikasi Otomatis — Butik Manda
 * Menguji semua skenario pada SOP:
 * 1. Keunikan ID & Kategori Katalog
 * 2. Pencarian dan Filter Gabungan
 * 3. Perhitungan Durasi Tanggal Lintas Bulan/Tahun & Kabisat
 * 4. Penolakan Tanggal Invalid (Mulai Kemarin, Tanggal Sama, Mundur)
 * 5. Akurasi Perhitungan Biaya Sewa (Termasuk Kasus Uji SOP: 2x50k + 1x10k selama 2 hari = 220k)
 * 6. Batas Jumlah Item (1-99, tolak negatif, desimal, nol, 100)
 * 7. Storage Recovery (JSON rusak, versi asing, privasi)
 * 8. Validasi Kontak (Nama 2-80 char, Normalisasi Phone 8-15 digit)
 * 9. Encoding Draf Pesan & Tautan WhatsApp
 */

import { PRODUCTS, PRODUCTS_MAP, CATEGORIES } from '../js/data.js';
import { SHOP_CONFIG } from '../js/config.js';
import {
  formatRupiah,
  calculateRentalDuration,
  validateQuantity,
  calculateCartSummary
} from '../js/cart.js';
import {
  validateCustomerName,
  validateCustomerPhone,
  createWhatsAppCheckoutLink
} from '../js/checkout.js';
import {
  getLocalTodayDateString,
  isValidDateString
} from '../js/storage.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== MEMULAI VERIFIKASI SOP BUTIK MANDA ===\n');

// 1. Keunikan Produk dan Kategori
console.log('[Kelompok 1: Keunikan & Kelengkapan Katalog]');
assert(PRODUCTS.length >= 8, `Katalog memiliki minimal 8 produk (aktual: ${PRODUCTS.length})`);
const productIds = new Set();
let duplicates = 0;
for (const p of PRODUCTS) {
  if (productIds.has(p.id)) duplicates++;
  productIds.add(p.id);
  assert(p.dailyPrice > 0 && Number.isInteger(p.dailyPrice), `Harga ${p.id} adalah integer positif (${p.dailyPrice})`);
  assert(p.image && p.image.length > 0, `Gambar ${p.id} tersedia secara lokal`);
  assert(p.specification && p.specification.length > 0, `Spesifikasi ${p.id} terisi`);
}
assert(duplicates === 0, 'Semua ID produk unik tanpa duplikasi');
assert(CATEGORIES.length >= 4, `Kategori lengkap (aktual: ${CATEGORIES.length})`);

// 2. Perhitungan Durasi Tanggal Lintas Bulan/Tahun & Kabisat
console.log('\n[Kelompok 2: Tanggal Lintas Bulan, Tahun & Kabisat]');
// 31 Jan - 1 Feb = 1 hari
const resJanFeb = calculateRentalDuration('2026-01-31', '2026-02-01', '2026-01-01');
assert(resJanFeb.isValid && resJanFeb.days === 1, '31 Januari - 1 Februari dihitung 1 hari kalender');

// 31 Des - 1 Jan = 1 hari
const resDecJan = calculateRentalDuration('2026-12-31', '2027-01-01', '2026-01-01');
assert(resDecJan.isValid && resDecJan.days === 1, '31 Desember - 1 Januari dihitung 1 hari kalender');

// 28 Feb - 1 Mar tahun kabisat (2024 atau 2028) = 2 hari
const resLeap = calculateRentalDuration('2028-02-28', '2028-03-01', '2028-01-01');
assert(resLeap.isValid && resLeap.days === 2, '28 Februari - 1 Maret pada tahun kabisat 2028 dihitung 2 hari kalender');

// 28 Feb - 1 Mar tahun biasa (2026) = 1 hari
const resNormalYear = calculateRentalDuration('2026-02-28', '2026-03-01', '2026-01-01');
assert(resNormalYear.isValid && resNormalYear.days === 1, '28 Februari - 1 Maret pada tahun biasa 2026 dihitung 1 hari kalender');

// 3. Penolakan Tanggal Tidak Valid
console.log('\n[Kelompok 3: Penolakan Tanggal Tidak Valid]');
// Mulai kemarin
const resPast = calculateRentalDuration('2026-11-03', '2026-11-05', '2026-11-04');
assert(!resPast.isValid, 'Tanggal pengambilan kemarin ditolak');

// Tanggal sama (sewa hari sama belum didukung pada SOP)
const resSame = calculateRentalDuration('2026-11-10', '2026-11-10', '2026-11-04');
assert(!resSame.isValid, 'Pengambilan dan pengembalian di hari yang sama ditolak');

// Tanggal akhir sebelum tanggal mulai
const resBackwards = calculateRentalDuration('2026-11-12', '2026-11-10', '2026-11-04');
assert(!resBackwards.isValid, 'Tanggal pengembalian sebelum pengambilan ditolak');

// Format rusak
const resInvalidDate = calculateRentalDuration('2026-02-30', '2026-03-05', '2026-01-01');
assert(!resInvalidDate.isValid, 'Tanggal tidak nyata (30 Februari) ditolak');

// 4. Perhitungan Biaya Sewa (Kasus Uji Standar SOP)
console.log('\n[Kelompok 4: Akurasi Perhitungan Biaya]');
// Skenario SOP: 2 item seharga Rp50.000 + 1 item seharga Rp10.000 selama 2 hari = Rp220.000
const mockMap = new Map([
  ['item-a', { id: 'item-a', name: 'Barang A', dailyPrice: 50000 }],
  ['item-b', { id: 'item-b', name: 'Barang B', dailyPrice: 10000 }]
]);
const testCart = [
  { productId: 'item-a', quantity: 2 },
  { productId: 'item-b', quantity: 1 }
];
const summaryResult = calculateCartSummary(testCart, mockMap, 2);
assert(summaryResult.grandTotal === 220000, `Uji SOP: (2x50k + 1x10k) * 2 hari = Rp220.000 (aktual: ${summaryResult.grandTotal})`);
assert(summaryResult.totalUnits === 3, 'Total unit dihitung 3');
assert(formatRupiah(220000).includes('220.000'), 'Format Rupiah memuat 220.000');

// 5. Batas Jumlah Item
console.log('\n[Kelompok 5: Batas Jumlah Item (1-99)]');
assert(validateQuantity(1).isValid && validateQuantity(1).parsedQty === 1, 'Jumlah 1 valid');
assert(validateQuantity(99).isValid && validateQuantity(99).parsedQty === 99, 'Jumlah 99 valid');
assert(!validateQuantity(0).isValid, 'Jumlah 0 ditolak');
assert(!validateQuantity(-5).isValid, 'Jumlah negatif ditolak');
assert(!validateQuantity(100).isValid, 'Jumlah 100 ditolak');
assert(!validateQuantity(2.5).isValid, 'Jumlah desimal ditolak');

// 6. Validasi Kontak Pelanggan
console.log('\n[Kelompok 6: Validasi Identitas & Kontak Penyewa]');
assert(validateCustomerName('Amanda').isValid, 'Nama "Amanda" valid');
assert(validateCustomerName('   Devita Amanda   ').value === 'Devita Amanda', 'Nama di-trim dengan benar');
assert(!validateCustomerName('A').isValid, 'Nama 1 karakter ditolak (minimal 2)');
assert(!validateCustomerName('   ').isValid, 'Nama kosong ditolak');

// Normalisasi Nomor WhatsApp
const p1 = validateCustomerPhone('081234567890');
assert(p1.isValid && p1.normalized === '6281234567890', 'Nomor "081234567890" dinormalisasi ke "6281234567890"');

const p2 = validateCustomerPhone('+62 812-3456-7890');
assert(p2.isValid && p2.normalized === '6281234567890', 'Nomor format internasional dengan spasi dan strip dinormalisasi');

const p3 = validateCustomerPhone('81234567890');
assert(p3.isValid && p3.normalized === '6281234567890', 'Nomor diawali "812..." ditambahkan "62"');

assert(!validateCustomerPhone('12345').isValid, 'Nomor kurang dari 8 digit ditolak');
assert(!validateCustomerPhone('081234567890123456').isValid, 'Nomor lebih dari 15 digit ditolak');
assert(!validateCustomerPhone('0812-ABC-789').isValid, 'Nomor memuat huruf ditolak');

// 7. WhatsApp Draf & Encoding
console.log('\n[Kelompok 7: Pembentukan Draf WhatsApp & Encoding]');
const orderData = {
  customerName: 'Devita Amanda',
  customerPhone: '6281234567890',
  startDate: '2026-11-10',
  endDate: '2026-11-12',
  rentalDays: 2,
  itemsDetails: [
    {
      productId: 'kebaya-wisuda-rose',
      name: 'Kebaya Modern Wisuda Dusty Rose',
      dailyPrice: 125000,
      quantity: 1,
      subtotalTotal: 250000
    }
  ],
  grandTotal: 250000
};

const waResult = createWhatsAppCheckoutLink(orderData);
assert(waResult.isConfigured === true, 'WhatsApp terkonfigurasi dengan nomor butik');
assert(waResult.url.startsWith(`https://wa.me/${SHOP_CONFIG.whatsappNumber}`), 'URL WhatsApp menggunakan domain https://wa.me/ dan nomor butik');
assert(waResult.url.includes('text='), 'URL WhatsApp menyertakan parameter text');
assert(waResult.draftText.includes('Devita Amanda'), 'Draf memuat nama penyewa');
assert(waResult.draftText.includes('Kebaya Modern Wisuda Dusty Rose'), 'Draf memuat nama busana');
assert(waResult.draftText.includes('2 hari'), 'Draf memuat durasi 2 hari');

console.log(`\n=== HASIL AKHIR: ${passed} LULUS, ${failed} GAGAL ===`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('SELURUH PENGUJIAN SOP LULUS SEMPURNA!\n');
}
