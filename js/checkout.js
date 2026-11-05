/**
 * Validasi Formulir & Pembentukan Tautan WhatsApp — Butik Manda
 * Mengikuti SOP: validasi nama & kontak defensif, URL encoding aman, 
 * serta perlindungan terhadap injeksi teks.
 */

import { SHOP_CONFIG } from './config.js';
import { formatRupiah } from './cart.js';

/**
 * Validasi Nama Penyewa
 * Kriteria: 2 - 80 karakter setelah di-trim
 * @param {string} rawName 
 * @returns {{ isValid: boolean, value: string, error: string | null }}
 */
export function validateCustomerName(rawName) {
  if (typeof rawName !== 'string') {
    return { isValid: false, value: '', error: 'Nama lengkap wajib diisi.' };
  }

  const trimmed = rawName.trim();
  if (trimmed.length === 0) {
    return { isValid: false, value: '', error: 'Silakan isi nama lengkap Anda.' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, value: trimmed, error: 'Nama minimal 2 karakter.' };
  }

  if (trimmed.length > 80) {
    return { isValid: false, value: trimmed, error: 'Nama maksimal 80 karakter.' };
  }

  return { isValid: true, value: trimmed, error: null };
}

/**
 * Normalisasi dan Validasi Nomor WhatsApp Penyewa
 * Kriteria: 8 - 15 digit setelah dinormalisasi; terima awalan 08, +62, 62, atau 8.
 *
 * @param {string} rawPhone 
 * @returns {{ isValid: boolean, normalized: string, display: string, error: string | null }}
 */
export function validateCustomerPhone(rawPhone) {
  if (typeof rawPhone !== 'string') {
    return { isValid: false, normalized: '', display: '', error: 'Nomor WhatsApp wajib diisi.' };
  }

  const trimmed = rawPhone.trim();
  if (trimmed.length === 0) {
    return { isValid: false, normalized: '', display: '', error: 'Silakan isi nomor WhatsApp Anda.' };
  }

  // Buang karakter umum non-digit seperti spasi, strip, tanda kurung, titik
  let cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Hilangkan tanda plus di depan jika ada
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Standarisasi awalan lokal Indonesia ke kode negara 62
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  // Periksa apakah hanya berisi digit angka
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      display: trimmed,
      error: 'Nomor WhatsApp hanya boleh memuat angka.'
    };
  }

  // Periksa batas panjang digit internasional (8 - 15 digit)
  if (cleaned.length < 8 || cleaned.length > 15) {
    return {
      isValid: false,
      normalized: cleaned,
      display: trimmed,
      error: 'Nomor WhatsApp harus berukuran 8–15 digit.'
    };
  }

  return {
    isValid: true,
    normalized: cleaned,
    display: cleaned,
    error: null
  };
}

/**
 * Format tanggal YYYY-MM-DD ke format bahasa Indonesia yang mudah dibaca
 * Contoh: "10 November 2026"
 */
export function formatDateIndonesian(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day} ${months[monthIdx]} ${year}`;
  }
  return dateStr;
}

/**
 * Membentuk teks pesan draf pengajuan sewa untuk WhatsApp
 */
export function buildWhatsAppDraftMessage({
  customerName,
  customerPhone,
  startDate,
  endDate,
  rentalDays,
  itemsDetails,
  grandTotal
}) {
  const formattedStart = formatDateIndonesian(startDate);
  const formattedEnd = formatDateIndonesian(endDate);

  const lines = [
    `Halo *${SHOP_CONFIG.brandName}*, saya ingin mengajukan penyewaan busana dengan rincian berikut:`,
    '',
    '📋 *DATA PENYEWA*',
    `• Nama Lengkap : ${customerName}`,
    `• WhatsApp    : ${customerPhone}`,
    '',
    '📅 *JADWAL PENYEWAAN*',
    `• Pengambilan  : ${formattedStart}`,
    `• Pengembalian : ${formattedEnd}`,
    `• Durasi Sewa  : ${rentalDays} hari`,
    '',
    '👗 *DAFTAR BUSANA & PERLENGKAPAN*'
  ];

  itemsDetails.forEach((item, index) => {
    const unitPrice = formatRupiah(item.dailyPrice);
    const subtotal = formatRupiah(item.subtotalTotal);
    lines.push(
      `${index + 1}. *${item.name}*`,
      `   Jumlah : ${item.quantity} unit`,
      `   Tarif  : ${unitPrice}/hari x ${rentalDays} hari = ${subtotal}`
    );
  });

  lines.push(
    '',
    '💰 *ESTIMASI TOTAL BIAYA SEWA*',
    `*${formatRupiah(grandTotal)}*`,
    '',
    '📌 *CATATAN KETENTUAN:*',
    `_Total di atas merupakan estimasi biaya sewa harian. Mohon informasi ketersediaan stok/ukuran, jadwal fitting, serta deposit jaminan di butik. Terima kasih!_`
  );

  return lines.join('\n');
}

/**
 * Membentuk URL WhatsApp lengkap (https://wa.me/...)
 * SOP: Validasi nomor usaha, encode seluruh teks pesan dengan encodeURIComponent
 *
 * @returns {{ isConfigured: boolean, url: string | null, draftText: string, error: string | null }}
 */
export function createWhatsAppCheckoutLink(orderData) {
  const shopNumber = SHOP_CONFIG.whatsappNumber;

  if (!shopNumber || typeof shopNumber !== 'string' || !/^\d{8,15}$/.test(shopNumber)) {
    return {
      isConfigured: false,
      url: null,
      draftText: '',
      error: 'Nomor kontak WhatsApp butik belum dikonfigurasi dengan benar.'
    };
  }

  const draftText = buildWhatsAppDraftMessage(orderData);
  const encodedText = encodeURIComponent(draftText);
  const url = `https://wa.me/${shopNumber}?text=${encodedText}`;

  return {
    isConfigured: true,
    url,
    draftText,
    error: null
  };
}
