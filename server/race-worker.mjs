import { openDb } from './db.mjs';
import { createCheckout, OrderError } from './checkout.mjs';

const [dbPath, workerId, attemptsRaw] = process.argv.slice(2);
const attempts = Number(attemptsRaw || 10);
const db = openDb(dbPath);
const placeOrder = createCheckout(db);

let success = 0;
let conflict = 0;
let other = 0;

for (let i = 0; i < attempts; i += 1) {
  try {
    placeOrder({
      customer: {
        name: `Penguji ${workerId}`,
        phone: '081234567890',
        address: 'Jalan Pengujian Nomor 10, Jakarta',
      },
      payment: 'transfer',
      idempotencyKey: `race-${workerId}-${i}-${Date.now()}`,
      items: [{ productId: 'race-item', qty: 1 }],
    });
    success += 1;
  } catch (error) {
    if (error instanceof OrderError && error.code === 'STOCK_CONFLICT') conflict += 1;
    else {
      other += 1;
      console.error(error);
    }
  }
}

db.close();
process.stdout.write(JSON.stringify({ workerId, success, conflict, other }));
