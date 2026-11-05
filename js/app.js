/**
 * Aplikasi Utama Butik Manda — Inisialisasi, State & Interaksi DOM
 * Sesuai Standar Operasional Prosedur (SOP) Sistem Statis Butik Manda
 */

import { SHOP_CONFIG } from './config.js';
import { PRODUCTS, PRODUCTS_MAP, CATEGORIES } from './data.js';
import {
  getLocalTodayDateString,
  loadCartDraft,
  saveCartDraft,
  clearCartStorage
} from './storage.js';
import {
  formatRupiah,
  calculateRentalDuration,
  validateQuantity,
  calculateCartSummary
} from './cart.js';
import {
  validateCustomerName,
  validateCustomerPhone,
  formatDateIndonesian,
  createWhatsAppCheckoutLink
} from './checkout.js';

// State Aplikasi Tersentralisasi (Single Source of Truth)
const state = {
  cartItems: [],              // Array<{ productId: string, quantity: number }>
  startDate: '',              // YYYY-MM-DD
  endDate: '',                // YYYY-MM-DD
  searchQuery: '',            // string
  selectedCategory: 'all',    // string
  customerName: '',           // string (hanya di memori formulir)
  customerPhone: '',          // string (hanya di memori formulir)
  isSummaryConfirmed: false,  // boolean
  storageAvailable: true
};

// Set ID Produk Valid untuk Verifikasi Storage
const validProductIds = new Set(PRODUCTS.map((p) => p.id));

/**
 * Inisialisasi Aplikasi Saat DOM Siap
 */
function init() {
  // 1. Muat data tersimpan dari localStorage
  const loaded = loadCartDraft(validProductIds);
  state.cartItems = loaded.items;
  state.startDate = loaded.startDate;
  state.endDate = loaded.endDate;
  state.storageAvailable = loaded.isStorageAvailable;

  // 2. Pasang tanggal minimum hari ini pada input tanggal native
  const todayStr = getLocalTodayDateString();
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  if (startDateInput) {
    startDateInput.min = todayStr;
    if (state.startDate) startDateInput.value = state.startDate;
  }
  if (endDateInput) {
    endDateInput.min = todayStr;
    if (state.endDate) endDateInput.value = state.endDate;
  }

  // 3. Pasang Event Listeners
  setupEventListeners();

  // 4. Render Komponen Awal
  renderCategories();
  renderProducts();
  renderCart();
  updateStorageWarning();
}

/**
 * Tampilkan pesan jika localStorage tidak dapat digunakan
 */
function updateStorageWarning() {
  const warningEl = document.getElementById('storage-warning');
  if (!warningEl) return;
  if (!state.storageAvailable) {
    warningEl.textContent = 'Penyimpanan lokal browser tidak aktif. Keranjang tetap dapat digunakan dalam sesi ini, tetapi tidak akan tersimpan setelah halaman ditutup.';
    warningEl.classList.remove('hidden');
  } else {
    warningEl.classList.add('hidden');
  }
}

/**
 * Simpan state keranjang ke localStorage
 */
function persistState() {
  if (!state.storageAvailable) return;
  const result = saveCartDraft({
    items: state.cartItems,
    startDate: state.startDate,
    endDate: state.endDate
  });
  if (!result.success) {
    showLiveMessage('Gagal menyimpan keranjang ke browser.');
  }
}

/**
 * Tampilkan pesan live accessibility (screen reader friendly)
 */
function showLiveMessage(msg) {
  const liveEl = document.getElementById('live-announcer');
  if (liveEl) {
    liveEl.textContent = msg;
  }
}

/**
 * Render tombol-tombol kategori
 */
function renderCategories() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  container.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `category-btn ${state.selectedCategory === cat.id ? 'active' : ''}`;
    btn.setAttribute('aria-pressed', state.selectedCategory === cat.id ? 'true' : 'false');
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;

    btn.addEventListener('click', () => {
      if (state.selectedCategory !== cat.id) {
        state.selectedCategory = cat.id;
        renderCategories();
        renderProducts();
      }
    });

    container.appendChild(btn);
  });
}

/**
 * Filter katalog produk berdasarkan kata kunci dan kategori
 */
function getFilteredProducts() {
  const q = state.searchQuery.toLowerCase().trim();
  const cat = state.selectedCategory;

  return PRODUCTS.filter((item) => {
    // Cocokkan kategori
    if (cat !== 'all' && item.category !== cat) {
      return false;
    }
    // Cocokkan teks pencarian
    if (q) {
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSpec = item.specification.toLowerCase().includes(q);
      const matchCat = item.categoryLabel.toLowerCase().includes(q);
      return matchName || matchDesc || matchSpec || matchCat;
    }
    return true;
  });
}

/**
 * Render grid katalog produk
 */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('results-count');
  const emptyState = document.getElementById('empty-catalog');
  if (!grid) return;

  const filtered = getFilteredProducts();

  if (countEl) {
    countEl.textContent = `Menampilkan ${filtered.length} dari ${PRODUCTS.length} koleksi busana`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  grid.innerHTML = '';

  const fragment = document.createDocumentFragment();

  filtered.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('aria-labelledby', `product-title-${product.id}`);

    // Image container
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'product-img-wrapper';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.imageAlt;
    img.width = 400;
    img.height = 350;
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    // Category badge
    const badge = document.createElement('span');
    badge.className = 'product-badge';
    badge.textContent = product.categoryLabel;
    imgWrapper.appendChild(badge);

    // Details container
    const body = document.createElement('div');
    body.className = 'product-body';

    const title = document.createElement('h3');
    title.id = `product-title-${product.id}`;
    title.className = 'product-title';
    title.textContent = product.name;

    const desc = document.createElement('p');
    desc.className = 'product-desc';
    desc.textContent = product.description;

    const spec = document.createElement('div');
    spec.className = 'product-spec';
    spec.textContent = product.specification;

    // Price and action
    const footer = document.createElement('div');
    footer.className = 'product-footer';

    const priceBox = document.createElement('div');
    priceBox.className = 'product-price-box';

    const priceLabel = document.createElement('span');
    priceLabel.className = 'price-label';
    priceLabel.textContent = 'Tarif Sewa';

    const priceValue = document.createElement('span');
    priceValue.className = 'price-value';
    priceValue.textContent = formatRupiah(product.dailyPrice);

    const pricePeriod = document.createElement('span');
    pricePeriod.className = 'price-period';
    pricePeriod.textContent = '/ unit / hari';

    priceBox.appendChild(priceLabel);
    priceBox.appendChild(priceValue);
    priceBox.appendChild(pricePeriod);

    // Add button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-primary add-to-cart-btn';
    addBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <span>Pilih Sewa</span>
    `;
    addBtn.setAttribute('aria-label', `Pilih sewa ${product.name} seharga ${formatRupiah(product.dailyPrice)} per hari`);

    addBtn.addEventListener('click', () => {
      addToCart(product.id);
    });

    footer.appendChild(priceBox);
    footer.appendChild(addBtn);

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(spec);
    body.appendChild(footer);

    card.appendChild(imgWrapper);
    card.appendChild(body);
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

/**
 * Tambah produk ke keranjang
 */
function addToCart(productId) {
  const existingIndex = state.cartItems.findIndex((it) => it.productId === productId);
  const product = PRODUCTS_MAP.get(productId);
  if (!product) return;

  if (existingIndex > -1) {
    const currentQty = state.cartItems[existingIndex].quantity;
    if (currentQty < SHOP_CONFIG.maxQuantity) {
      state.cartItems[existingIndex].quantity += 1;
      showLiveMessage(`Jumlah sewa ${product.name} ditambah menjadi ${state.cartItems[existingIndex].quantity}.`);
    } else {
      showLiveMessage(`Batas maksimal pemesanan ${SHOP_CONFIG.maxQuantity} unit telah tercapai.`);
    }
  } else {
    state.cartItems.push({
      productId,
      quantity: 1
    });
    showLiveMessage(`${product.name} berhasil ditambahkan ke keranjang.`);
  }

  // Setiap perubahan isi keranjang membatalkan status verifikasi ringkasan
  state.isSummaryConfirmed = false;
  persistState();
  renderCart();
  renderSummarySection();

  // Animasi singkat / highlight pada badge keranjang
  const headerCartBadge = document.getElementById('header-cart-count');
  if (headerCartBadge) {
    headerCartBadge.classList.add('badge-pulse');
    setTimeout(() => headerCartBadge.classList.remove('badge-pulse'), 400);
  }
}

/**
 * Ubah jumlah produk di keranjang
 */
function updateItemQuantity(productId, newQty) {
  const validation = validateQuantity(newQty);
  if (!validation.isValid) {
    alert(validation.error);
    renderCart();
    return;
  }

  const itemIndex = state.cartItems.findIndex((it) => it.productId === productId);
  if (itemIndex > -1) {
    state.cartItems[itemIndex].quantity = validation.parsedQty;
    state.isSummaryConfirmed = false;
    persistState();
    renderCart();
    renderSummarySection();
  }
}

/**
 * Hapus produk dari keranjang
 */
function removeFromCart(productId) {
  const product = PRODUCTS_MAP.get(productId);
  state.cartItems = state.cartItems.filter((it) => it.productId !== productId);
  state.isSummaryConfirmed = false;
  persistState();
  renderCart();
  renderSummarySection();
  if (product) {
    showLiveMessage(`${product.name} dihapus dari keranjang.`);
  }
}

/**
 * Kosongkan seluruh isi keranjang
 */
function clearAllCart() {
  if (state.cartItems.length === 0) return;
  if (confirm('Apakah Anda yakin ingin mengosongkan seluruh isi keranjang sewa?')) {
    state.cartItems = [];
    state.isSummaryConfirmed = false;
    clearCartStorage();
    renderCart();
    renderSummarySection();
    showLiveMessage('Keranjang sewa telah dikosongkan.');
  }
}

/**
 * Render tampilan keranjang, tanggal, dan ringkasan kalkulasi
 */
function renderCart() {
  const cartList = document.getElementById('cart-items-list');
  const cartEmpty = document.getElementById('cart-empty-message');
  const cartContent = document.getElementById('cart-content');
  const headerCount = document.getElementById('header-cart-count');
  const floatingCount = document.getElementById('floating-cart-count');
  const floatingBar = document.getElementById('floating-cart-bar');

  // Validasi durasi tanggal
  const durationCheck = calculateRentalDuration(state.startDate, state.endDate);
  const rentalDays = durationCheck.isValid ? durationCheck.days : 0;

  // Hitung ringkasan biaya
  const summary = calculateCartSummary(state.cartItems, PRODUCTS_MAP, rentalDays);

  // Update badge jumlah item
  if (headerCount) headerCount.textContent = String(summary.totalUnits);
  if (floatingCount) floatingCount.textContent = String(summary.totalUnits);

  // Floating bar di mobile
  if (floatingBar) {
    if (summary.totalUnits > 0) {
      floatingBar.classList.remove('hidden');
    } else {
      floatingBar.classList.add('hidden');
    }
  }

  // Jika keranjang kosong
  if (state.cartItems.length === 0) {
    if (cartEmpty) cartEmpty.classList.remove('hidden');
    if (cartContent) cartContent.classList.add('hidden');
    if (cartList) cartList.innerHTML = '';
    renderPriceCalculation(summary, durationCheck);
    return;
  }

  if (cartEmpty) cartEmpty.classList.add('hidden');
  if (cartContent) cartContent.classList.remove('hidden');

  if (!cartList) return;
  cartList.innerHTML = '';

  const fragment = document.createDocumentFragment();

  summary.itemsDetails.forEach((item) => {
    const row = document.createElement('li');
    row.className = 'cart-item-row';

    // Thumbnail
    const thumb = document.createElement('img');
    thumb.src = item.product.image;
    thumb.alt = '';
    thumb.className = 'cart-item-thumb';
    thumb.width = 64;
    thumb.height = 56;

    // Info
    const info = document.createElement('div');
    info.className = 'cart-item-info';

    const name = document.createElement('h4');
    name.className = 'cart-item-name';
    name.textContent = item.name;

    const rate = document.createElement('div');
    rate.className = 'cart-item-rate';
    rate.textContent = `${formatRupiah(item.dailyPrice)} / hari`;

    info.appendChild(name);
    info.appendChild(rate);

    // Quantity controls
    const qtyControls = document.createElement('div');
    qtyControls.className = 'qty-controls';

    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'qty-btn';
    decBtn.setAttribute('aria-label', `Kurangi jumlah ${item.name}`);
    decBtn.textContent = '−';
    decBtn.addEventListener('click', () => {
      if (item.quantity > 1) {
        updateItemQuantity(item.productId, item.quantity - 1);
      } else {
        removeFromCart(item.productId);
      }
    });

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'qty-input';
    qtyInput.min = String(SHOP_CONFIG.minQuantity);
    qtyInput.max = String(SHOP_CONFIG.maxQuantity);
    qtyInput.value = String(item.quantity);
    qtyInput.setAttribute('aria-label', `Jumlah untuk ${item.name}`);
    qtyInput.addEventListener('change', (e) => {
      updateItemQuantity(item.productId, e.target.value);
    });

    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'qty-btn';
    incBtn.setAttribute('aria-label', `Tambah jumlah ${item.name}`);
    incBtn.textContent = '+';
    incBtn.addEventListener('click', () => {
      if (item.quantity < SHOP_CONFIG.maxQuantity) {
        updateItemQuantity(item.productId, item.quantity + 1);
      }
    });

    qtyControls.appendChild(decBtn);
    qtyControls.appendChild(qtyInput);
    qtyControls.appendChild(incBtn);

    // Subtotal
    const subtotalBox = document.createElement('div');
    subtotalBox.className = 'cart-item-subtotal';

    const subtotalLabel = document.createElement('span');
    subtotalLabel.className = 'subtotal-label';
    subtotalLabel.textContent = rentalDays > 0 ? `Subtotal (${rentalDays} hr)` : 'Subtotal / hari';

    const subtotalVal = document.createElement('span');
    subtotalVal.className = 'subtotal-value';
    subtotalVal.textContent = formatRupiah(rentalDays > 0 ? item.subtotalTotal : item.subtotalPerDay);

    subtotalBox.appendChild(subtotalLabel);
    subtotalBox.appendChild(subtotalVal);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'cart-del-btn';
    delBtn.setAttribute('aria-label', `Hapus ${item.name} dari keranjang`);
    delBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    delBtn.addEventListener('click', () => {
      removeFromCart(item.productId);
    });

    row.appendChild(thumb);
    row.appendChild(info);
    row.appendChild(qtyControls);
    row.appendChild(subtotalBox);
    row.appendChild(delBtn);

    fragment.appendChild(row);
  });

  cartList.appendChild(fragment);
  renderPriceCalculation(summary, durationCheck);
}

/**
 * Render kotak rincian durasi dan kalkulasi harga
 */
function renderPriceCalculation(summary, durationCheck) {
  const durationText = document.getElementById('calc-duration-text');
  const dateErrorEl = document.getElementById('date-error-message');
  const totalPerDayEl = document.getElementById('calc-rate-per-day');
  const grandTotalEl = document.getElementById('calc-grand-total');
  const calcNoteEl = document.getElementById('calc-status-note');

  // Error tanggal
  if (dateErrorEl) {
    if (state.startDate && state.endDate && !durationCheck.isValid) {
      dateErrorEl.textContent = durationCheck.error;
      dateErrorEl.classList.remove('hidden');
    } else {
      dateErrorEl.textContent = '';
      dateErrorEl.classList.add('hidden');
    }
  }

  // Durasi sewa
  if (durationText) {
    if (durationCheck.isValid) {
      durationText.textContent = `${durationCheck.days} Hari Kalender`;
    } else {
      durationText.textContent = 'Belum ditentukan';
    }
  }

  // Tarif harian total
  if (totalPerDayEl) {
    totalPerDayEl.textContent = formatRupiah(summary.totalPerDay);
  }

  // Grand total & catatan
  if (grandTotalEl) {
    if (durationCheck.isValid && summary.totalUnits > 0) {
      grandTotalEl.textContent = formatRupiah(summary.grandTotal);
      if (calcNoteEl) {
        calcNoteEl.textContent = `Estimasi biaya ${summary.totalUnits} unit busana untuk ${durationCheck.days} hari sewa.`;
        calcNoteEl.className = 'calc-note text-success';
      }
    } else if (summary.totalUnits > 0) {
      grandTotalEl.textContent = `${formatRupiah(summary.totalPerDay)} / hari`;
      if (calcNoteEl) {
        calcNoteEl.textContent = 'Pilih tanggal pengambilan & pengembalian untuk menghitung total durasi sewa.';
        calcNoteEl.className = 'calc-note text-muted';
      }
    } else {
      grandTotalEl.textContent = 'Rp 0';
      if (calcNoteEl) {
        calcNoteEl.textContent = 'Keranjang masih kosong. Pilih busana di katalog untuk memulai.';
        calcNoteEl.className = 'calc-note text-muted';
      }
    }
  }
}

/**
 * Render bagian pemeriksaan ringkasan pengajuan (Review Step)
 */
function renderSummarySection() {
  const reviewContainer = document.getElementById('review-summary-panel');
  const reviewContent = document.getElementById('review-summary-content');
  const waActionBtn = document.getElementById('wa-submit-btn');
  const waConfigNotice = document.getElementById('wa-config-notice');

  if (!reviewContainer || !reviewContent) return;

  if (!state.isSummaryConfirmed) {
    reviewContainer.classList.add('hidden');
    return;
  }

  const durationCheck = calculateRentalDuration(state.startDate, state.endDate);
  if (!durationCheck.isValid || state.cartItems.length === 0) {
    state.isSummaryConfirmed = false;
    reviewContainer.classList.add('hidden');
    return;
  }

  const summary = calculateCartSummary(state.cartItems, PRODUCTS_MAP, durationCheck.days);

  // Susun data order
  const orderData = {
    customerName: state.customerName,
    customerPhone: state.customerPhone,
    startDate: state.startDate,
    endDate: state.endDate,
    rentalDays: durationCheck.days,
    itemsDetails: summary.itemsDetails,
    grandTotal: summary.grandTotal
  };

  const checkoutLinkResult = createWhatsAppCheckoutLink(orderData);

  // Render teks ringkasan secara aman via DOM (hindari injeksi HTML pengguna)
  reviewContent.innerHTML = '';

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'review-details-box';

  // Info penyewa
  const pName = document.createElement('p');
  pName.innerHTML = `<strong>Nama Penyewa:</strong> <span></span>`;
  pName.querySelector('span').textContent = state.customerName;

  const pPhone = document.createElement('p');
  pPhone.innerHTML = `<strong>Nomor WhatsApp:</strong> <span></span>`;
  pPhone.querySelector('span').textContent = state.customerPhone;

  const pDates = document.createElement('p');
  pDates.innerHTML = `<strong>Jadwal Sewa:</strong> <span>${formatDateIndonesian(state.startDate)} s/d ${formatDateIndonesian(state.endDate)} (${durationCheck.days} hari)</span>`;

  tableWrapper.appendChild(pName);
  tableWrapper.appendChild(pPhone);
  tableWrapper.appendChild(pDates);

  // Daftar barang
  const itemsTitle = document.createElement('h4');
  itemsTitle.className = 'review-items-heading';
  itemsTitle.textContent = 'Daftar Busana & Rincian Tarif:';
  tableWrapper.appendChild(itemsTitle);

  const itemsList = document.createElement('ul');
  itemsList.className = 'review-items-list';

  summary.itemsDetails.forEach((it) => {
    const li = document.createElement('li');
    const line1 = document.createElement('div');
    line1.className = 'review-item-name';
    line1.textContent = `${it.name} (x${it.quantity})`;

    const line2 = document.createElement('div');
    line2.className = 'review-item-sub';
    line2.textContent = `${formatRupiah(it.dailyPrice)}/hari × ${durationCheck.days} hari = ${formatRupiah(it.subtotalTotal)}`;

    li.appendChild(line1);
    li.appendChild(line2);
    itemsList.appendChild(li);
  });
  tableWrapper.appendChild(itemsList);

  // Total
  const totalBox = document.createElement('div');
  totalBox.className = 'review-total-box';
  totalBox.innerHTML = `
    <span>Estimasi Total Biaya Sewa:</span>
    <strong>${formatRupiah(summary.grandTotal)}</strong>
  `;
  tableWrapper.appendChild(totalBox);

  reviewContent.appendChild(tableWrapper);

  // Cek konfigurasi WhatsApp butik
  if (checkoutLinkResult.isConfigured && checkoutLinkResult.url) {
    if (waActionBtn) {
      waActionBtn.href = checkoutLinkResult.url;
      waActionBtn.removeAttribute('aria-disabled');
      waActionBtn.classList.remove('btn-disabled');
    }
    if (waConfigNotice) waConfigNotice.classList.add('hidden');
  } else {
    if (waActionBtn) {
      waActionBtn.removeAttribute('href');
      waActionBtn.setAttribute('aria-disabled', 'true');
      waActionBtn.classList.add('btn-disabled');
    }
    if (waConfigNotice) {
      waConfigNotice.textContent = 'Pengajuan online belum dapat dibuka karena nomor kontak WhatsApp butik belum dikonfigurasi. Silakan hubungi langsung Butik Manda melalui alamat atau email yang tertera.';
      waConfigNotice.classList.remove('hidden');
    }
  }

  reviewContainer.classList.remove('hidden');
  reviewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Handle Verifikasi Form Checkout
 */
function handleReviewSubmit(e) {
  e.preventDefault();

  // 1. Cek isi keranjang
  if (state.cartItems.length === 0) {
    alert('Keranjang sewa Anda masih kosong. Silakan pilih busana di katalog terlebih dahulu.');
    const catalogSec = document.getElementById('katalog');
    if (catalogSec) catalogSec.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // 2. Cek tanggal pengambilan & pengembalian
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const durationCheck = calculateRentalDuration(state.startDate, state.endDate);

  if (!durationCheck.isValid) {
    alert(durationCheck.error);
    if (!state.startDate && startDateInput) {
      startDateInput.focus();
    } else if (endDateInput) {
      endDateInput.focus();
    }
    return;
  }

  // 3. Cek nama penyewa
  const nameInput = document.getElementById('customer-name');
  const nameVal = nameInput ? nameInput.value : '';
  const nameCheck = validateCustomerName(nameVal);

  const nameErrorEl = document.getElementById('name-error-message');
  if (!nameCheck.isValid) {
    if (nameErrorEl) {
      nameErrorEl.textContent = nameCheck.error;
      nameErrorEl.classList.remove('hidden');
    }
    if (nameInput) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.focus();
    }
    return;
  } else {
    if (nameErrorEl) nameErrorEl.classList.add('hidden');
    if (nameInput) nameInput.removeAttribute('aria-invalid');
  }

  // 4. Cek nomor WhatsApp penyewa
  const phoneInput = document.getElementById('customer-phone');
  const phoneVal = phoneInput ? phoneInput.value : '';
  const phoneCheck = validateCustomerPhone(phoneVal);

  const phoneErrorEl = document.getElementById('phone-error-message');
  if (!phoneCheck.isValid) {
    if (phoneErrorEl) {
      phoneErrorEl.textContent = phoneCheck.error;
      phoneErrorEl.classList.remove('hidden');
    }
    if (phoneInput) {
      phoneInput.setAttribute('aria-invalid', 'true');
      phoneInput.focus();
    }
    return;
  } else {
    if (phoneErrorEl) phoneErrorEl.classList.add('hidden');
    if (phoneInput) phoneInput.removeAttribute('aria-invalid');
  }

  // Simpan nama & kontak di memori formulir
  state.customerName = nameCheck.value;
  state.customerPhone = phoneCheck.normalized;
  state.isSummaryConfirmed = true;

  renderSummarySection();
  showLiveMessage('Ringkasan pengajuan berhasil diperiksa. Silakan tinjau dan lanjutkan ke WhatsApp.');
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Input Pencarian
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearSearchBtn) {
        if (state.searchQuery) {
          clearSearchBtn.classList.remove('hidden');
        } else {
          clearSearchBtn.classList.add('hidden');
        }
      }
      renderProducts();
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      searchInput.focus();
      renderProducts();
    });
  }

  // Tombol Reset Katalog saat kosong
  const resetCatalogBtn = document.getElementById('reset-catalog-btn');
  if (resetCatalogBtn) {
    resetCatalogBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.selectedCategory = 'all';
      if (searchInput) searchInput.value = '';
      if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
      renderCategories();
      renderProducts();
    });
  }

  // Input Tanggal Pengambilan
  const startDateInput = document.getElementById('start-date');
  if (startDateInput) {
    startDateInput.addEventListener('change', (e) => {
      state.startDate = e.target.value;
      state.isSummaryConfirmed = false;
      persistState();
      renderCart();
      renderSummarySection();
    });
  }

  // Input Tanggal Pengembalian
  const endDateInput = document.getElementById('end-date');
  if (endDateInput) {
    endDateInput.addEventListener('change', (e) => {
      state.endDate = e.target.value;
      state.isSummaryConfirmed = false;
      persistState();
      renderCart();
      renderSummarySection();
    });
  }

  // Tombol Kosongkan Keranjang
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearAllCart);
  }

  // Input Kontak (reset ringkasan jika diedit setelah verifikasi)
  const nameInput = document.getElementById('customer-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (state.isSummaryConfirmed) {
        state.isSummaryConfirmed = false;
        renderSummarySection();
      }
    });
  }

  const phoneInput = document.getElementById('customer-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      if (state.isSummaryConfirmed) {
        state.isSummaryConfirmed = false;
        renderSummarySection();
      }
    });
  }

  // Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleReviewSubmit);
  }

  // Tombol Ubah Pengajuan
  const editSummaryBtn = document.getElementById('edit-summary-btn');
  if (editSummaryBtn) {
    editSummaryBtn.addEventListener('click', () => {
      state.isSummaryConfirmed = false;
      renderSummarySection();
      const cartSec = document.getElementById('keranjang');
      if (cartSec) cartSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Tombol WA Submit (Catatan SOP: Pengguna menekan kirim sendiri di WhatsApp)
  const waSubmitBtn = document.getElementById('wa-submit-btn');
  if (waSubmitBtn) {
    waSubmitBtn.addEventListener('click', (e) => {
      if (!state.isSummaryConfirmed) {
        e.preventDefault();
        alert('Silakan periksa formulir terlebih dahulu.');
      }
    });
  }
}

// Jalankan init setelah DOM selesai diparse
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
