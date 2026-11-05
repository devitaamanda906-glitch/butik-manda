/**
 * Penyimpanan Lokal Aman (localStorage) — Butik Manda
 * Mengikuti SOP: baca/tulis defensif, validasi skema ketat, tidak menyimpan
 * data pribadi (nama/kontak) maupun harga kalkulasi di penyimpanan persisten.
 */

import { SHOP_CONFIG } from './config.js';

/**
 * Mendapatkan tanggal hari ini dalam format lokal YYYY-MM-DD
 * Menghindari penggunaan toISOString() yang rentan pergeseran zona waktu UTC.
 */
export function getLocalTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validasi format tanggal YYYY-MM-DD dan keabsahan kalender
 */
export function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);

  if (m < 1 || m > 12 || d < 1 || d > 31) return false;

  // Cek tanggal aktual dalam kalender
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  return (
    dateObj.getUTCFullYear() === y &&
    dateObj.getUTCMonth() === m - 1 &&
    dateObj.getUTCDate() === d
  );
}

/**
 * Membaca draft keranjang secara aman dari localStorage
 * @param {Set<string>} validProductIds - Set ID produk valid dari katalog
 * @returns {{ items: Array<{ productId: string, quantity: number }>, startDate: string, endDate: string, isStorageAvailable: boolean }}
 */
export function loadCartDraft(validProductIds) {
  const fallback = {
    items: [],
    startDate: '',
    endDate: '',
    isStorageAvailable: true
  };

  try {
    const raw = localStorage.getItem(SHOP_CONFIG.storageKey);
    if (!raw) {
      return fallback;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // JSON rusak, bersihkan dan kembalikan state awal yang aman
      localStorage.removeItem(SHOP_CONFIG.storageKey);
      return fallback;
    }

    // SOP: Periksa versi skema
    if (!parsed || typeof parsed !== 'object' || parsed.schemaVersion !== SHOP_CONFIG.schemaVersion) {
      localStorage.removeItem(SHOP_CONFIG.storageKey);
      return fallback;
    }

    // Validasi daftar item
    const validItemsMap = new Map();
    if (Array.isArray(parsed.items)) {
      for (const item of parsed.items) {
        if (!item || typeof item !== 'object') continue;
        const { productId, quantity } = item;

        if (typeof productId === 'string' && validProductIds.has(productId)) {
          const qty = Number(quantity);
          if (
            Number.isInteger(qty) &&
            qty >= SHOP_CONFIG.minQuantity &&
            qty <= SHOP_CONFIG.maxQuantity
          ) {
            // Gabung jika ada item duplikat
            const existing = validItemsMap.get(productId) || 0;
            const combined = Math.min(existing + qty, SHOP_CONFIG.maxQuantity);
            validItemsMap.set(productId, combined);
          }
        }
      }
    }

    const items = Array.from(validItemsMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }));

    // Validasi tanggal
    let startDate = '';
    let endDate = '';
    const today = getLocalTodayDateString();

    if (isValidDateString(parsed.startDate)) {
      // Jika tanggal pengambilan sebelum hari ini, hapus tanggal agar pengguna memilih ulang
      if (parsed.startDate >= today) {
        startDate = parsed.startDate;
      }
    }

    if (isValidDateString(parsed.endDate)) {
      // Hanya terima endDate jika startDate valid dan endDate > startDate
      if (startDate && parsed.endDate > startDate) {
        endDate = parsed.endDate;
      }
    }

    return {
      items,
      startDate,
      endDate,
      isStorageAvailable: true
    };
  } catch (err) {
    // localStorage diblokir atau mode private yang menolak akses
    return {
      ...fallback,
      isStorageAvailable: false
    };
  }
}

/**
 * Menyimpan draft keranjang ke localStorage
 * SOP: Hanya menyimpan ID, jumlah, dan tanggal sewa.
 * Jangan menyimpan harga, nama pelanggan, atau nomor telepon.
 */
export function saveCartDraft({ items, startDate, endDate }) {
  try {
    const payload = {
      schemaVersion: SHOP_CONFIG.schemaVersion,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity
      })),
      startDate: startDate || '',
      endDate: endDate || ''
    };

    localStorage.setItem(SHOP_CONFIG.storageKey, JSON.stringify(payload));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: 'Penyimpanan lokal browser tidak dapat diakses atau penuh.'
    };
  }
}

/**
 * Mengosongkan keranjang di localStorage
 */
export function clearCartStorage() {
  try {
    localStorage.removeItem(SHOP_CONFIG.storageKey);
    return true;
  } catch {
    return false;
  }
}
