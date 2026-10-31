import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const SEED_PRODUCTS = [
  {
    id: 'ponsel-5g-8-256',
    name: 'Ponsel 5G 8/256 GB',
    category: 'Ponsel',
    price: 4299000,
    stock: 12,
    unit: 'unit',
    summary: 'Layar 6,6 inci, baterai 5.000 mAh, kamera utama 50 MP.',
    caption:
      'Ponsel harian dengan layar lebar dan baterai besar. Cocok untuk chatting, peta, dan foto keluarga.',
    specs: ['RAM 8 GB, penyimpanan 256 GB', 'Layar 6,6 inci 120 Hz', 'Baterai 5.000 mAh, charger 33 W', 'Garansi toko 12 bulan'],
    art: 'phone',
  },
  {
    id: 'ponsel-lipat-12-512',
    name: 'Ponsel lipat 12/512 GB',
    category: 'Ponsel',
    price: 14999000,
    stock: 3,
    unit: 'unit',
    summary: 'Layar lipat 7,6 inci, engsel uji 200.000 lipatan.',
    caption:
      'Ponsel lipat untuk layar kerja yang lebih lega. Bobot ringan, tapi tetap sebaiknya dicoba dulu di toko.',
    specs: ['RAM 12 GB, penyimpanan 512 GB', 'Layar dalam 7,6 inci', 'Kamera utama 50 MP', 'Garansi toko 12 bulan'],
    art: 'foldable',
  },
  {
    id: 'motor-matic-110',
    name: 'Motor matic 110cc',
    category: 'Motor',
    price: 18750000,
    stock: 4,
    unit: 'unit',
    summary: 'Mesin 110cc, tangki 4,2 liter, bagasi bawah jok.',
    caption:
      'Motor matic harian untuk dalam kota. Termasuk STNK dan kelengkapan surat, tanpa asuransi.',
    specs: ['Mesin 110cc injeksi', 'Tangki 4,2 liter', 'Berat 98 kg', 'Surat lengkap, garansi mesin 1 tahun'],
    art: 'scooter',
  },
  {
    id: 'motor-bebek-125',
    name: 'Motor bebek 125cc',
    category: 'Motor',
    price: 16200000,
    stock: 5,
    unit: 'unit',
    summary: 'Mesin 125cc, transmisi 4 percepatan, velg jari-jari.',
    caption:
      'Motor bebek untuk perjalanan campur dalam dan luar kota. Stok sedang kosong di gudang.',
    specs: ['Mesin 125cc', 'Transmisi 4 percepatan', 'Kapasitas tangki 4 liter', 'Surat lengkap, garansi mesin 1 tahun'],
    art: 'moped',
  },
  {
    id: 'rice-cooker-18',
    name: 'Rice cooker 1,8 liter',
    category: 'Rumah Tangga',
    price: 389000,
    stock: 25,
    unit: 'buah',
    summary: 'Kapasitas 1,8 liter, lapisan anti lengket, mode hangat.',
    caption:
      'Rice cooker ukuran keluarga kecil. Cukup untuk 6 sampai 8 porsi sekali masak.',
    specs: ['Kapasitas 1,8 liter', 'Daya 400 W', 'Mode masak dan hangat', 'Garansi toko 6 bulan'],
    art: 'ricecooker',
  },
  {
    id: 'kipas-meja-16',
    name: 'Kipas angin meja 16 inci',
    category: 'Rumah Tangga',
    price: 215000,
    stock: 40,
    unit: 'buah',
    summary: 'Tiga kecepatan, baling-baling 16 inci, alas anti gores.',
    caption:
      'Kipas meja untuk kamar atau ruang kerja. Kabel 1,5 meter dan tombol putar tiga tingkat.',
    specs: ['Diameter baling-baling 16 inci', 'Daya 45 W', 'Tiga tingkat kecepatan', 'Kabel 1,5 meter'],
    art: 'fan',
  },
  {
    id: 'smart-tv-43',
    name: 'Smart TV 43 inci',
    category: 'Elektronik',
    price: 3150000,
    stock: 7,
    unit: 'unit',
    summary: 'Panel 43 inci Full HD, dua port HDMI, sudah ada WiFi.',
    caption:
      'Televisi untuk ruang keluarga. Sudah mendukung aplikasi streaming bawaan.',
    specs: ['Layar 43 inci Full HD', 'WiFi dan LAN', 'Dua port HDMI, dua port USB', 'Garansi toko 12 bulan'],
    art: 'tv',
  },
  {
    id: 'laptop-14-16-512',
    name: 'Laptop 14 inci 16/512 GB',
    category: 'Elektronik',
    price: 9850000,
    stock: 6,
    unit: 'unit',
    summary: 'RAM 16 GB, SSD 512 GB, layar 14 inci, bobot 1,4 kg.',
    caption:
      'Laptop untuk kerja kantor, kelas, dan editing ringan. Baterai tahan sekitar 8 jam pemakaian campur.',
    specs: ['RAM 16 GB, SSD 512 GB', 'Layar 14 inci 1920 x 1200', 'Bobot 1,4 kg', 'Garansi toko 12 bulan'],
    art: 'laptop',
  },
  {
    id: 'blender-15',
    name: 'Blender 1,5 liter',
    category: 'Rumah Tangga',
    price: 279000,
    stock: 18,
    unit: 'buah',
    summary: 'Jarum baja, dua kecepatan, gelas 1,5 liter.',
    caption:
      'Blender untuk bumbu, buah, dan es kecil. Gelas kaca 1,5 liter dengan tutup rapat.',
    specs: ['Kapasitas 1,5 liter', 'Daya 350 W', 'Dua kecepatan dan pulse', 'Gelas kaca, garansi toko 6 bulan'],
    art: 'blender',
  },
  {
    id: 'setrika-uap',
    name: 'Setrika uap 1.800 W',
    category: 'Rumah Tangga',
    price: 189000,
    stock: 0,
    unit: 'buah',
    summary: 'Uap 25 g/menit, pelat keramik, tangki 240 ml.',
    caption:
      'Setrika uap untuk pakaian kerja. Pelat keramik dan semprotan air. Stok sedang kosong di gudang.',
    specs: ['Daya 1.800 W', 'Uap 25 g/menit', 'Tangki air 240 ml', 'Pelat keramik'],
    art: 'iron',
  },
];

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    unit TEXT NOT NULL,
    summary TEXT NOT NULL,
    caption TEXT NOT NULL,
    specs TEXT NOT NULL,
    art TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('transfer', 'qris')),
    total INTEGER NOT NULL CHECK (total >= 0),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0)
  );

  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`;

export function openDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA journal_mode = WAL');
  db.exec(SCHEMA);
  return db;
}

export function seed(db) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  if (Number(count) > 0) return false;
  const insert = db.prepare(`
    INSERT INTO products (id, name, category, price, stock, unit, summary, caption, specs, art)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const p of SEED_PRODUCTS) {
      insert.run(p.id, p.name, p.category, p.price, p.stock, p.unit, p.summary, p.caption, JSON.stringify(p.specs), p.art);
    }
    db.exec('COMMIT');
    return true;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    unit: row.unit,
    summary: row.summary,
    caption: row.caption,
    specs: JSON.parse(row.specs),
    art: row.art,
  };
}
