import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'toko-order-'));
const dbPath = join(dir, 'order.sqlite');
const port = 18000 + Math.floor(Math.random() * 1000);
const base = `http://127.0.0.1:${port}`;

const child = spawn(process.execPath, [join(here, 'index.mjs')], {
  env: { ...process.env, PORT: String(port), DB_PATH: dbPath },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stderr = '';
child.stderr.on('data', (chunk) => {
  stderr += chunk;
});

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Server berhenti sebelum siap: ${stderr}`);
    }
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {
      // server belum menerima koneksi
    }
    await wait(100);
  }
  throw new Error(`Server tidak siap dalam 6 detik: ${stderr}`);
}

try {
  await waitForServer();

  const checkoutResponse = await fetch(`${base}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        name: 'Penguji Pesanan',
        phone: '081234567890',
        address: 'Jalan Pengujian Nomor 10, Jakarta',
      },
      payment: 'transfer',
      idempotencyKey: `order-test-${Date.now()}`,
      items: [{ productId: 'rice-cooker-18', qty: 2 }],
    }),
  });
  assert.equal(checkoutResponse.status, 201, 'Checkout harus membuat pesanan baru.');
  const created = await checkoutResponse.json();
  assert.ok(created.order?.code, 'Respons checkout harus memuat kode pesanan.');

  const orderResponse = await fetch(`${base}/api/orders/${created.order.code}`);
  assert.equal(orderResponse.status, 200, 'Pesanan harus bisa dibuka lewat kode.');
  const fetched = await orderResponse.json();
  assert.equal(fetched.order.code, created.order.code);
  assert.equal(fetched.order.total, created.order.total);
  assert.equal(fetched.order.customer.phone, '+6281234567890');
  assert.deepEqual(
    fetched.order.items.map((item) => [item.productId, item.qty]),
    created.order.items.map((item) => [item.productId, item.qty]),
  );

  const lowerCase = await fetch(
    `${base}/api/orders/${created.order.code.toLowerCase()}`,
  );
  assert.equal(lowerCase.status, 200, 'Kode pesanan harus dicari tanpa peduli huruf besar-kecil.');

  const missing = await fetch(`${base}/api/orders/TL-20000101-AAAAAA`);
  assert.equal(missing.status, 404, 'Kode yang tidak ada harus menghasilkan 404.');

  console.log('LULUS uji endpoint pesanan');
  console.log(`  kode pesanan : ${created.order.code}`);
  console.log(`  total        : ${created.order.total}`);
  console.log(`  item         : ${fetched.order.items.length}`);
} finally {
  if (child.exitCode === null) {
    child.kill();
    await new Promise((resolveExit) => child.once('exit', resolveExit));
  }
  rmSync(dir, { recursive: true, force: true });
}
