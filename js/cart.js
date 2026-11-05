/**
 * Logika Perhitungan Keranjang & Tanggal Sewa — Butik Manda
 * Fungsi-fungsi murni untuk validasi tanggal kalender, durasi, subtotal, dan total estimasi.
 */

import { SHOP_CONFIG } from './config.js';
import { getLocalTodayDateString, isValidDateString } from './storage.js';

/**
 * Format angka ke mata uang Rupiah Indonesia (IDR)
 * Format standar: "Rp 150.000"
 */
export function formatRupiah(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount).replace(/\u00A0/g, ' ');
}

/**
 * Validasi dan perhitungan durasi sewa berdasarkan selisih hari kalender.
 * SOP: Menggunakan Date.UTC(y, m-1, d) untuk menghindari pergeseran jam/zona waktu.
 * Tanggal pengembalian HARUS setelah tanggal pengambilan (minimal 1 hari sewa).
 *
 * @param {string} startDate - Tanggal pengambilan YYYY-MM-DD
 * @param {string} endDate - Tanggal pengembalian YYYY-MM-DD
 * @param {string} [currentDate] - Tanggal acuan hari ini (opsional, default: getLocalTodayDateString())
 * @returns {{ isValid: boolean, days: number, error: string | null }}
 */
export function calculateRentalDuration(startDate, endDate, currentDate = getLocalTodayDateString()) {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      days: 0,
      error: 'Silakan pilih tanggal pengambilan dan pengembalian.'
    };
  }

  if (!isValidDateString(startDate)) {
    return {
      isValid: false,
      days: 0,
      error: 'Format tanggal pengambilan tidak valid (gunakan format YYYY-MM-DD).'
    };
  }

  if (!isValidDateString(endDate)) {
    return {
      isValid: false,
      days: 0,
      error: 'Format tanggal pengembalian tidak valid (gunakan format YYYY-MM-DD).'
    };
  }

  // Tanggal mulai tidak boleh sebelum hari ini
  if (startDate < currentDate) {
    return {
      isValid: false,
      days: 0,
      error: 'Tanggal pengambilan tidak boleh sebelum hari ini.'
    };
  }

  // Tanggal pengembalian harus setelah tanggal pengambilan (sewa hari sama belum didukung)
  if (endDate <= startDate) {
    return {
      isValid: false,
      days: 0,
      error: 'Tanggal pengembalian harus setelah tanggal pengambilan.'
    };
  }

  const [y1, m1, d1] = startDate.split('-').map(Number);
  const [y2, m2, d2] = endDate.split('-').map(Number);

  const utcStart = Date.UTC(y1, m1 - 1, d1);
  const utcEnd = Date.UTC(y2, m2 - 1, d2);

  const diffMs = utcEnd - utcStart;
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days < 1) {
    return {
      isValid: false,
      days: 0,
      error: 'Durasi sewa minimal adalah 1 hari.'
    };
  }

  return {
    isValid: true,
    days,
    error: null
  };
}

/**
 * Validasi jumlah item sewa (1 - 99 bulat)
 * @param {any} quantity 
 * @returns {{ isValid: boolean, parsedQty: number, error: string | null }}
 */
export function validateQuantity(quantity) {
  const num = Number(quantity);

  if (!Number.isInteger(num)) {
    return {
      isValid: false,
      parsedQty: 1,
      error: 'Jumlah harus berupa bilangan bulat.'
    };
  }

  if (num < SHOP_CONFIG.minQuantity) {
    return {
      isValid: false,
      parsedQty: SHOP_CONFIG.minQuantity,
      error: `Jumlah minimal adalah ${SHOP_CONFIG.minQuantity} unit.`
    };
  }

  if (num > SHOP_CONFIG.maxQuantity) {
    return {
      isValid: false,
      parsedQty: SHOP_CONFIG.maxQuantity,
      error: `Jumlah maksimal adalah ${SHOP_CONFIG.maxQuantity} unit.`
    };
  }

  return {
    isValid: true,
    parsedQty: num,
    error: null
  };
}

/**
 * Menghitung rincian biaya keranjang berdasarkan katalog terbaru dan durasi sewa
 * SOP: Subtotal barang = harga harian × jumlah × durasi. Total = jumlah seluruh subtotal.
 *
 * @param {Array<{ productId: string, quantity: number }>} cartItems
 * @param {Map<string, object>} catalogMap - Peta produk dari data.js
 * @param {number} rentalDays - Durasi hari (jika 0 atau tidak valid, estimasi harian ditampilkan)
 * @returns {{
 *   itemsDetails: Array<{
 *     productId: string,
 *     name: string,
 *     dailyPrice: number,
 *     quantity: number,
 *     subtotalPerDay: number,
 *     subtotalTotal: number,
 *     product: object
 *   }>,
 *   totalUnits: number,
 *   totalPerDay: number,
 *   grandTotal: number,
 *   hasValidDuration: boolean
 * }}
 */
export function calculateCartSummary(cartItems, catalogMap, rentalDays = 0) {
  let totalUnits = 0;
  let totalPerDay = 0;
  let grandTotal = 0;
  const itemsDetails = [];

  for (const item of cartItems) {
    const product = catalogMap.get(item.productId);
    if (!product) continue; // Abaikan item yang ID-nya sudah tidak ada di katalog

    const qtyValidation = validateQuantity(item.quantity);
    const qty = qtyValidation.isValid ? qtyValidation.parsedQty : 1;

    const dailyPrice = product.dailyPrice;
    const subtotalPerDay = dailyPrice * qty;
    const subtotalTotal = rentalDays > 0 ? subtotalPerDay * rentalDays : subtotalPerDay;

    totalUnits += qty;
    totalPerDay += subtotalPerDay;
    grandTotal += subtotalTotal;

    itemsDetails.push({
      productId: item.productId,
      name: product.name,
      dailyPrice,
      quantity: qty,
      subtotalPerDay,
      subtotalTotal,
      product
    });
  }

  return {
    itemsDetails,
    totalUnits,
    totalPerDay,
    grandTotal: rentalDays > 0 ? grandTotal : 0,
    hasValidDuration: rentalDays > 0
  };
}
