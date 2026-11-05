/** Katalog busana Butik Manda dengan aset gambar lokal milik pemilik butik. */
export const CATEGORIES = Object.freeze([
  { id: 'all', label: 'Semua Koleksi' },
  { id: 'gaun', label: 'Gaun Pesta & Dress' }
]);

const imageNames = Object.freeze({
  'busana-01.jpg': 'gaun-navy-korset.png',
  'busana-02.jpg': 'gaun-biru-ruffle.png',
  'busana-03.jpg': 'gaun-beige-rosette.png',
  'busana-04.jpg': 'gaun-hijau-mint-ekor.png',
  'busana-05.jpg': 'gaun-hitam-korset.png',
  'busana-06.jpg': 'gaun-ivory-ruffle.png',
  'busana-07.jpg': 'gaun-silver-glitter.png',
  'busana-08.jpg': 'gaun-silver-cape.png',
  'busana-09.jpg': 'gaun-champagne-ruffle.png',
  'busana-10.jpg': 'gaun-hitam-lengan-putih.png',
  'busana-11.jpg': 'gaun-maroon-draperi.png',
  'busana-12.jpg': 'gaun-burgundy-ivory.png',
  'busana-13.jpg': 'gaun-putih-cape-pink.png',
  'busana-14.jpg': 'dress-beige-belahan.png',
  'busana-15.jpg': 'gaun-pink-payet.png',
  'busana-16.jpg': 'gaun-pink-bunga.png',
  'busana-17.jpg': 'gaun-biru-pita.png',
  'busana-18.jpg': 'gaun-hitam-sequin.png',
  'busana-19.jpg': 'gaun-merah-bordir.jpg',
  'busana-20.jpg': 'busana-navy-tulle.png'
});

const productNames = Object.freeze({
  'busana-01.jpg': 'Gaun Navy Biru Korset',
  'busana-02.jpg': 'Gaun Biru Muda Ruffle',
  'busana-03.jpg': 'Gaun Beige Draperi Rosette',
  'busana-04.jpg': 'Gaun Hijau Mint Ekor Panjang',
  'busana-05.jpg': 'Gaun Hitam Korset Belahan',
  'busana-06.jpg': 'Gaun Ivory Ruffle Bertingkat',
  'busana-07.jpg': 'Gaun Silver Glitter Sheer',
  'busana-08.jpg': 'Gaun Silver Abu Cape',
  'busana-09.jpg': 'Gaun Champagne Ruffle',
  'busana-10.jpg': 'Gaun Hitam Lengan Putih',
  'busana-11.jpg': 'Gaun Maroon Draperi Ekor',
  'busana-12.jpg': 'Gaun Burgundy dan Ivory',
  'busana-13.jpg': 'Gaun Putih Cape Pink',
  'busana-14.jpg': 'Dress Beige Belahan Samping',
  'busana-15.jpg': 'Gaun Pink Payet Bertingkat',
  'busana-16.jpg': 'Gaun Pink Kelopak Bunga',
  'busana-17.jpg': 'Gaun Biru Muda Pita Besar',
  'busana-18.jpg': 'Gaun Hitam Sequin Cape',
  'busana-19.jpg': 'Gaun Merah Bunga Transparan',
  'busana-20.jpg': 'Busana Navy Rok Tulle'
});

const image = (name) => `./images/${imageNames[name] || name}`;
const productDescriptions = Object.freeze({
  'busana-01.jpg': 'Gaun navy biru dengan korset berkilau dan rok satin panjang yang elegan.',
  'busana-02.jpg': 'Gaun biru muda dengan ruffle besar di bagian bahu, atasan transparan, dan rok panjang ringan.',
  'busana-03.jpg': 'Gaun beige berpotongan mermaid dengan draperi menyilang dan detail rosette di pinggang.',
  'busana-04.jpg': 'Gaun hijau mint berkilau dengan rok pendek asimetris dan ekor panjang berlapis.',
  'busana-05.jpg': 'Gaun hitam dengan atasan korset renda, rok draperi, dan belahan tinggi yang anggun.',
  'busana-06.jpg': 'Gaun ivory putih dengan atasan satin tanpa lengan dan rok renda ruffle bertingkat.',
  'busana-07.jpg': 'Gaun silver berkilau dengan korset berhias, rok transparan, dan ekor panjang.',
  'busana-08.jpg': 'Gaun silver abu berhias payet dengan siluet mermaid dan cape panjang di kedua sisi.',
  'busana-09.jpg': 'Gaun champagne dengan ruffle dramatis di sisi tubuh, belahan depan, dan ekor lembut.',
  'busana-10.jpg': 'Gaun hitam siluet mermaid dengan lengan putih transparan bervolume dan detail ruffle.',
  'busana-11.jpg': 'Gaun maroon gelap dengan atasan bertekstur, draperi pinggang, dan ekor panjang.',
  'busana-12.jpg': 'Gaun burgundy velvet dengan rok ivory kontras dan ekor panjang yang anggun.',
  'busana-13.jpg': 'Gaun putih panjang dengan cape pink transparan bertepi hiasan dan aksen bunga.',
  'busana-14.jpg': 'Dress beige midi berpotongan ramping dengan draperi leher dan belahan samping.',
  'busana-15.jpg': 'Gaun pink berkilau bertingkat dengan rok dramatis dan detail payet di seluruh permukaan.',
  'busana-16.jpg': 'Gaun pink bertingkat berbentuk kelopak bunga dengan detail glitter dan hiasan bunga di pinggang.',
  'busana-17.jpg': 'Gaun biru muda berhias motif elegan dengan pita besar dan ekor panjang di kedua sisi.',
  'busana-18.jpg': 'Gaun hitam sequin berkilau dengan lengan puff transparan dan cape panjang.',
  'busana-19.jpg': 'Gaun merah dan nude transparan dengan bordir bunga, lengan panjang, serta ekor velvet.',
  'busana-20.jpg': 'Busana navy biru dengan rok pendek berhias emas, lapisan tulle hitam transparan, dan selendang panjang.'
});
const productAlts = Object.freeze({
  'busana-01.jpg': 'Model memakai gaun navy biru dengan korset berkilau.',
  'busana-02.jpg': 'Model memakai gaun biru muda off shoulder dengan ruffle.',
  'busana-03.jpg': 'Model memakai gaun beige draperi dengan detail rosette.',
  'busana-04.jpg': 'Model memakai gaun hijau mint dengan ekor panjang.',
  'busana-05.jpg': 'Model memakai gaun hitam berkorset dengan belahan tinggi.',
  'busana-06.jpg': 'Model memakai gaun ivory dengan rok renda ruffle bertingkat.',
  'busana-07.jpg': 'Model memakai gaun silver glitter dengan rok sheer dan ekor.',
  'busana-08.jpg': 'Model memakai gaun silver abu mermaid dengan cape panjang.',
  'busana-09.jpg': 'Model memakai gaun champagne dengan ruffle besar dan belahan.',
  'busana-10.jpg': 'Model memakai gaun hitam dengan lengan putih transparan.',
  'busana-11.jpg': 'Model memakai gaun maroon berdraperi dengan ekor panjang.',
  'busana-12.jpg': 'Model memakai gaun burgundy velvet dengan rok ivory.',
  'busana-13.jpg': 'Gaun putih dengan cape pink transparan berhias bunga.',
  'busana-14.jpg': 'Model memakai dress beige midi dengan belahan samping.',
  'busana-15.jpg': 'Gaun pink payet dengan rok bertingkat dramatis.',
  'busana-16.jpg': 'Gaun pink berlapis berbentuk kelopak bunga.',
  'busana-17.jpg': 'Model memakai gaun biru muda dengan pita besar.',
  'busana-18.jpg': 'Model memakai gaun hitam sequin dengan lengan puff dan cape.',
  'busana-19.jpg': 'Model memakai gaun merah transparan berhias bordir bunga.',
  'busana-20.jpg': 'Model memakai busana navy dengan rok tulle hitam transparan.'
});
const makeProduct = (id, _name, description, specification, dailyPrice, imageName, imageAlt) => ({
  id,
  name: productNames[imageName] || _name,
  category: 'gaun',
  categoryLabel: 'Gaun Pesta & Dress',
  description: productDescriptions[imageName] || description,
  specification, dailyPrice, image: image(imageName), imageAlt: productAlts[imageName] || imageAlt
});

export const PRODUCTS = Object.freeze([
  makeProduct('gaun-biru-ruffle', 'Busana 01 — Biru Muda', 'Gaun biru muda dengan kerutan ruffle besar di bagian bahu dan rok panjang.', 'Ukuran S-M, cocok untuk pesta dan acara malam.', 180000, 'busana-01.jpg', 'Model memakai gaun biru muda ruffle off shoulder.'),
  makeProduct('dress-satin-champagne', 'Busana 02 — Beige', 'Dress beige dengan bagian dada berdraperi dan belahan di sisi rok.', 'Ukuran S-M, cocok untuk pesta dan acara semi-formal.', 175000, 'busana-02.jpg', 'Model memakai dress beige dengan draperi dan belahan samping.'),
  makeProduct('dress-korset-hitam-krem', 'Busana 03 — Hitam dan Krem', 'Gaun hitam berkorset dengan kain cape krem panjang di kedua sisi.', 'Ukuran M-L, cocok untuk pesta malam.', 220000, 'busana-03.jpg', 'Model memakai gaun hitam dengan cape krem panjang.'),
  makeProduct('gaun-mermaid-mutiara', 'Busana 04 — Biru Muda dan Mutiara', 'Gaun biru muda berbentuk mermaid dengan hiasan mutiara dan kain bahu lebar.', 'Ukuran M, cocok untuk pesta dan gala dinner.', 250000, 'busana-04.jpg', 'Model memakai gaun biru muda one shoulder berhias mutiara.'),
  makeProduct('dress-qipao-hijau', 'Busana 05 — Hijau Mint', 'Mini dress hijau mint dengan kerah tinggi dan motif bunga bergaya oriental.', 'Ukuran S-M, cocok untuk acara semi-formal.', 135000, 'busana-05.jpg', 'Model memakai mini dress hijau mint bergaya qipao.'),
  makeProduct('gaun-silver-ekor', 'Busana 06 — Silver', 'Gaun silver berkilau dengan rok mermaid dan cape panjang di kedua sisi.', 'Ukuran M-L, cocok untuk pesta formal.', 280000, 'busana-06.jpg', 'Model memakai gaun silver mermaid dengan cape panjang.'),
  makeProduct('gaun-burgundy-draperi', 'Busana 07 — Burgundy', 'Gaun burgundy dengan draperi di pinggang dan rok panjang yang menjuntai.', 'Ukuran S-M, cocok untuk gala dan resepsi.', 230000, 'busana-07.jpg', 'Model memakai gaun burgundy berdraperi dengan ekor panjang.'),
  makeProduct('gaun-maroon-ekor', 'Busana 08 — Maroon', 'Gaun maroon gelap dengan detail kerut di pinggang dan ekor panjang.', 'Ukuran S-M, cocok untuk pesta malam.', 240000, 'busana-08.jpg', 'Model memakai gaun maroon gelap dengan ekor panjang.'),
  makeProduct('dress-pink-bunga', 'Busana 09 — Pink Bunga', 'Gaun pink bertingkat dengan rok berbentuk kelopak bunga besar.', 'Ukuran anak dan dewasa, cocok untuk pesta.', 150000, 'busana-09.jpg', 'Gaun pink bertingkat berbentuk kelopak bunga.'),
  makeProduct('gaun-pink-payet', 'Busana 10 — Pink', 'Gaun pink berlapis dengan aksen kupu-kupu dan hiasan berkilau.', 'Ukuran S-M, cocok untuk pesta dan pentas.', 165000, 'busana-10.jpg', 'Gaun pink bertingkat dengan aksen kupu-kupu.'),
  makeProduct('gaun-hitam-lace', 'Busana 11 — Hitam', 'Gaun hitam panjang dengan lapisan lace transparan pada lengan dan bahu.', 'Ukuran M-L, cocok untuk pesta malam.', 220000, 'busana-11.jpg', 'Model memakai gaun hitam dengan lengan lace transparan.'),
  makeProduct('gaun-putih-selendang-pink', 'Busana 12 — Putih dan Pink', 'Gaun putih panjang dengan cape pink transparan dan hiasan bunga di bahu.', 'Ukuran S-M, cocok untuk acara resmi.', 210000, 'busana-12.jpg', 'Model memakai gaun putih dengan cape pink transparan.'),
  makeProduct('gaun-merah-ivory', 'Busana 13 — Merah dan Ivory', 'Gaun merah dengan bagian rok ivory dan ekor merah yang menjuntai.', 'Ukuran S-M, cocok untuk pesta formal.', 245000, 'busana-13.jpg', 'Model memakai gaun merah dan ivory dengan ekor panjang.'),
  makeProduct('gaun-hitam-lengan-putih', 'Busana 14 — Hitam dan Putih', 'Gaun hitam siluet mermaid dengan lengan organza putih bervolume.', 'Ukuran M, cocok untuk pesta malam.', 225000, 'busana-14.jpg', 'Model memakai gaun hitam dengan lengan organza putih.'),
  makeProduct('gaun-navy-gold', 'Busana 15 — Navy dan Hitam', 'Busana navy biru tua dengan rok tulle hitam transparan dan selendang panjang.', 'Ukuran S-M, cocok untuk pesta malam.', 235000, 'busana-15.jpg', 'Model memakai busana navy dengan rok tulle hitam transparan.'),
  makeProduct('gaun-biru-bow', 'Busana 16 — Biru Muda', 'Gaun biru muda berornamen dengan pita besar di sisi kanan dan kiri.', 'Ukuran M-L, cocok untuk pesta formal.', 260000, 'busana-16.jpg', 'Model memakai gaun biru muda dengan pita besar.'),
  makeProduct('gaun-hitam-sequin', 'Busana 17 — Hitam Berkilau', 'Gaun hitam berkilau dengan lengan puff dan cape transparan panjang.', 'Ukuran S-M, cocok untuk gala dinner.', 260000, 'busana-17.jpg', 'Model memakai gaun hitam sequin dengan cape transparan.'),
  makeProduct('gaun-hitam-korset', 'Busana 18 — Hitam', 'Gaun hitam dengan bagian atas berkorset dan rok panjang berbelahan tinggi.', 'Ukuran S-M, cocok untuk acara malam.', 215000, 'busana-18.jpg', 'Model memakai gaun hitam berkorset dengan belahan tinggi.'),
  makeProduct('gaun-merah-bunga', 'Busana 19 — Merah', 'Gaun merah dengan bordir bunga pada bagian dada, lengan, dan rok panjang.', 'Ukuran M, cocok untuk pesta formal.', 255000, 'busana-19.jpg', 'Model memakai gaun merah dengan bordir bunga.'),
  makeProduct('gaun-putih-mermaid', 'Busana 20 — Ivory dan Putih', 'Gaun ivory putih dengan bagian atas satin dan rok ruffle bertingkat.', 'Ukuran S-M, cocok untuk acara spesial.', 250000, 'busana-20.jpg', 'Model memakai gaun ivory mermaid dengan rok ruffle.')
]);

export const PRODUCTS_MAP = Object.freeze(new Map(PRODUCTS.map((product) => [product.id, product])));
