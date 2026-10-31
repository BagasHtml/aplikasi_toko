import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const STOCK = 10;
const WORKERS = 4;
const ATTEMPTS_PER_WORKER = 10;
const dir = mkdtempSync(join(tmpdir(), 'toko-race-'));
const dbPath = join(dir, 'race.sqlite');

function runWorker(workerId) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [join(here, 'race-worker.mjs'), dbPath, String(workerId), String(ATTEMPTS_PER_WORKER)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => {
      out += chunk;
    });
    child.stderr.on('data', (chunk) => {
      err += chunk;
    });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code !== 0) {
        rejectPromise(new Error(`Worker ${workerId} gagal: ${err || code}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(out));
      } catch {
        rejectPromise(new Error(`Worker ${workerId} mengirim output tidak valid: ${out}`));
      }
    });
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const setup = openDb(dbPath);
setup
  .prepare('INSERT INTO products (id, name, category, price, stock, unit, summary, caption, specs, art) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  .run('race-item', 'Barang uji race', 'Uji', 1000, STOCK, 'unit', 'Uji', 'Uji', '[]', 'phone');
setup.close();

try {
  const results = await Promise.all(Array.from({ length: WORKERS }, (_, index) => runWorker(index + 1)));
  const success = results.reduce((sum, item) => sum + item.success, 0);
  const conflict = results.reduce((sum, item) => sum + item.conflict, 0);
  const other = results.reduce((sum, item) => sum + item.other, 0);

  const check = openDb(dbPath);
  const stock = Number(check.prepare('SELECT stock FROM products WHERE id = ?').get('race-item').stock);
  const orders = Number(check.prepare('SELECT COUNT(*) AS n FROM orders').get().n);
  const sold = Number(check.prepare('SELECT COALESCE(SUM(qty), 0) AS n FROM order_items').get().n);
  check.close();

  assert(other === 0, `Ada ${other} kegagalan tak terduga.`);
  assert(success === STOCK, `Harusnya ${STOCK} pesanan berhasil, ternyata ${success}.`);
  assert(conflict === WORKERS * ATTEMPTS_PER_WORKER - STOCK, `Jumlah konflik stok tidak sesuai: ${conflict}.`);
  assert(stock === 0, `Stok akhir harus 0, ternyata ${stock}.`);
  assert(stock >= 0, 'Stok tidak boleh minus.');
  assert(orders === STOCK, `Jumlah order harus ${STOCK}, ternyata ${orders}.`);
  assert(sold === STOCK, `Jumlah barang terjual harus ${STOCK}, ternyata ${sold}.`);

  console.log('LULUS uji race condition lintas proses');
  console.log(`  stok awal      : ${STOCK}`);
  console.log(`  percobaan      : ${WORKERS * ATTEMPTS_PER_WORKER} checkout paralel dari ${WORKERS} proses`);
  console.log(`  berhasil       : ${success}`);
  console.log(`  ditolak        : ${conflict}`);
  console.log(`  stok akhir     : ${stock}`);
  console.log(`  barang terjual : ${sold}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
