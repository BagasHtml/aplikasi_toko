import { randomBytes } from 'node:crypto';
import { validatePhone } from '../shared/phone.js';

export class OrderError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'OrderError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const PAYMENTS = new Set(['transfer', 'qris']);
const MAX_LINES = 20;
const MAX_QTY = 99;
const ORDER_CODE = /^TL-\d{8}-[0-9A-F]{6}$/;

function orderFromRow(row, items) {
  if (!row) return null;
  return {
    code: row.code,
    customer: {
      name: row.customer_name,
      phone: row.phone,
      address: row.address,
    },
    payment: row.payment_method,
    total: Number(row.total),
    createdAt: row.created_at,
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      qty: Number(item.qty),
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.qty) * Number(item.unit_price),
    })),
  };
}

export function findOrderByCode(db, code) {
  const normalized = typeof code === 'string' ? code.trim().toUpperCase() : '';
  if (!ORDER_CODE.test(normalized)) return null;
  const row = db.prepare('SELECT * FROM orders WHERE code = ?').get(normalized);
  if (!row) return null;
  const items = db
    .prepare(
      'SELECT product_id, name, qty, unit_price FROM order_items WHERE order_id = ? ORDER BY id',
    )
    .all(row.id);
  return orderFromRow(row, items);
}

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function orderCode() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  return `TL-${stamp}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export function createCheckout(db) {
  const selectProduct = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?');
  const decrementStock = db.prepare(
    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
  );
  const selectOrderByKey = db.prepare('SELECT * FROM orders WHERE idempotency_key = ?');
  const insertOrder = db.prepare(`
    INSERT INTO orders (code, idempotency_key, customer_name, phone, address, payment_method, total, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, qty, unit_price)
    VALUES (?, ?, ?, ?, ?)
  `);
  const selectItems = db.prepare(
    'SELECT product_id, name, qty, unit_price FROM order_items WHERE order_id = ? ORDER BY id',
  );

  function hydrate(row) {
    if (!row) return null;
    return orderFromRow(row, selectItems.all(row.id));
  }

  function validate(input) {
    const fields = {};
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new OrderError(400, 'INVALID_BODY', 'Isi pesanan tidak terbaca. Muat ulang halaman lalu coba lagi.');
    }

    const customer = input.customer;
    const name = asText(customer?.name);
    if (name.length < 2) fields.name = 'Nama penerima minimal 2 karakter.';
    else if (name.length > 80) fields.name = 'Nama penerima maksimal 80 karakter.';

    const phoneCheck = validatePhone(customer?.phone);
    if (!phoneCheck.ok) fields.phone = phoneCheck.message;

    const address = asText(customer?.address);
    if (address.length < 10) fields.address = 'Alamat minimal 10 karakter, sebutkan jalan dan nomor rumah.';
    else if (address.length > 240) fields.address = 'Alamat maksimal 240 karakter.';

    const payment = asText(input.payment);
    if (!PAYMENTS.has(payment)) fields.payment = 'Pilih metode pembayaran transfer atau QRIS.';

    const idempotencyKey = asText(input.idempotencyKey);
    if (idempotencyKey.length < 8 || idempotencyKey.length > 100) {
      fields.idempotencyKey = 'Kunci pesanan tidak valid. Muat ulang halaman lalu coba lagi.';
    }

    if (!Array.isArray(input.items) || input.items.length === 0) {
      fields.items = 'Keranjang kosong. Tambahkan barang dulu.';
    } else if (input.items.length > MAX_LINES) {
      fields.items = `Satu pesanan maksimal ${MAX_LINES} jenis barang.`;
    }

    if (Object.keys(fields).length > 0) {
      throw new OrderError(400, 'VALIDATION_FAILED', 'Ada isian yang perlu diperbaiki.', { fields });
    }

    const merged = new Map();
    for (const item of input.items) {
      const productId = asText(item?.productId);
      const qty = item?.qty;
      if (!productId) {
        throw new OrderError(400, 'INVALID_ITEM', 'Ada barang tanpa kode produk. Hapus lalu tambahkan ulang.');
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        throw new OrderError(400, 'INVALID_QTY', `Jumlah barang harus bilangan bulat 1 sampai ${MAX_QTY}.`);
      }
      merged.set(productId, (merged.get(productId) ?? 0) + qty);
    }
    for (const [productId, qty] of merged) {
      if (qty > MAX_QTY) {
        throw new OrderError(400, 'INVALID_QTY', `Jumlah untuk ${productId} melebihi ${MAX_QTY}.`);
      }
    }

    return {
      customer: { name, phone: phoneCheck.value, address },
      payment,
      idempotencyKey,
      items: [...merged].map(([productId, qty]) => ({ productId, qty })),
    };
  }

  return function placeOrder(input) {
    const clean = validate(input);

    const existing = selectOrderByKey.get(clean.idempotencyKey);
    if (existing) return { order: hydrate(existing), reused: true };

    db.exec('BEGIN IMMEDIATE');
    try {
      const raced = selectOrderByKey.get(clean.idempotencyKey);
      if (raced) {
        db.exec('COMMIT');
        return { order: hydrate(raced), reused: true };
      }

      const conflicts = [];
      const lines = [];
      for (const item of clean.items) {
        const product = selectProduct.get(item.productId);
        if (!product) {
          conflicts.push({
            productId: item.productId,
            name: 'Barang tidak ditemukan',
            requested: item.qty,
            available: 0,
            reason: 'NOT_FOUND',
          });
          continue;
        }
        const result = decrementStock.run(item.qty, item.productId, item.qty);
        if (Number(result.changes) !== 1) {
          conflicts.push({
            productId: product.id,
            name: product.name,
            requested: item.qty,
            available: Number(product.stock),
            reason: 'OUT_OF_STOCK',
          });
          continue;
        }
        lines.push({
          productId: product.id,
          name: product.name,
          qty: item.qty,
          unitPrice: Number(product.price),
        });
      }

      if (conflicts.length > 0) {
        db.exec('ROLLBACK');
        throw new OrderError(
          409,
          'STOCK_CONFLICT',
          'Stok berubah saat kamu checkout. Tidak ada stok yang dikurangi.',
          { conflicts },
        );
      }

      const total = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
      const createdAt = new Date().toISOString();

      let code = orderCode();
      let orderId;
      for (let attempt = 0; ; attempt += 1) {
        try {
          const inserted = insertOrder.run(
            code,
            clean.idempotencyKey,
            clean.customer.name,
            clean.customer.phone,
            clean.customer.address,
            clean.payment,
            total,
            createdAt,
          );
          orderId = Number(inserted.lastInsertRowid);
          break;
        } catch (error) {
          if (attempt < 5 && String(error?.message).includes('orders.code')) {
            code = orderCode();
            continue;
          }
          throw error;
        }
      }

      for (const line of lines) {
        insertItem.run(orderId, line.productId, line.name, line.qty, line.unitPrice);
      }

      db.exec('COMMIT');

      return {
        order: {
          code,
          customer: clean.customer,
          payment: clean.payment,
          total,
          createdAt,
          items: lines.map((line) => ({
            ...line,
            lineTotal: line.qty * line.unitPrice,
          })),
        },
        reused: false,
      };
    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch {
        // transaksi sudah ditutup
      }
      if (error instanceof OrderError) throw error;
      if (String(error?.message).includes('orders.idempotency_key')) {
        const duplicate = selectOrderByKey.get(clean.idempotencyKey);
        if (duplicate) return { order: hydrate(duplicate), reused: true };
      }
      throw new OrderError(
        500,
        'ORDER_FAILED',
        'Pesanan gagal disimpan. Tidak ada stok yang dikurangi. Coba lagi.',
      );
    }
  };
}
