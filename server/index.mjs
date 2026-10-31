import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, rowToProduct, seed } from './db.mjs';
import { createCheckout, findOrderByCode, OrderError } from './checkout.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const distDir = join(root, 'dist');
const dbPath = process.env.DB_PATH || join(here, 'data', 'toko.sqlite');
const port = Number(process.env.PORT || 8787);

const db = openDb(dbPath);
seed(db);
const placeOrder = createCheckout(db);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolveBody, rejectBody) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 64 * 1024) {
        rejectBody(new OrderError(413, 'BODY_TOO_LARGE', 'Data pesanan terlalu besar.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        rejectBody(new OrderError(400, 'INVALID_BODY', 'Data pesanan kosong.'));
        return;
      }
      try {
        resolveBody(JSON.parse(raw));
      } catch {
        rejectBody(new OrderError(400, 'INVALID_BODY', 'Data pesanan bukan JSON yang valid.'));
      }
    });
    req.on('error', rejectBody);
  });
}

function productQuery(searchParams) {
  const q = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const clauses = [];
  const values = [];
  if (q) {
    clauses.push('(name LIKE ? OR summary LIKE ? OR category LIKE ?)');
    const like = `%${q}%`;
    values.push(like, like, like);
  }
  if (category && category !== 'Semua') {
    clauses.push('category = ?');
    values.push(category);
  }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM products${where} ORDER BY category, name`).all(...values);
  const categories = db
    .prepare('SELECT DISTINCT category FROM products ORDER BY category')
    .all()
    .map((row) => row.category);
  return {
    products: rows.map(rowToProduct),
    categories,
    total: rows.length,
  };
}

async function serveStatic(req, res, pathname) {
  if (!existsSync(distDir)) {
    sendJson(res, 404, {
      error: {
        code: 'NOT_FOUND',
        message: 'Halaman tidak ditemukan. Jalankan mode pengembangan lewat Vite.',
      },
    });
    return;
  }
  let target = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  if (target.includes('..')) {
    sendJson(res, 400, { error: { code: 'BAD_PATH', message: 'Alamat tidak valid.' } });
    return;
  }
  let file = join(distDir, target);
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(distDir, 'index.html');
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Content-Length': body.length,
    });
    res.end(body);
  } catch {
    sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Berkas tidak ditemukan.' } });
  }
}

const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/health') {
      sendJson(res, 200, { ok: true, database: 'sqlite', time: new Date().toISOString() });
      return;
    }

    if (pathname === '/api/products' && req.method === 'GET') {
      sendJson(res, 200, productQuery(url.searchParams));
      return;
    }

    if (pathname.startsWith('/api/products/') && req.method === 'GET') {
      const id = decodeURIComponent(pathname.slice('/api/products/'.length));
      const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!row) {
        sendJson(res, 404, {
          error: { code: 'PRODUCT_NOT_FOUND', message: 'Barang ini tidak ada di katalog.' },
        });
        return;
      }
      sendJson(res, 200, { product: rowToProduct(row) });
      return;
    }

    if (pathname.startsWith('/api/orders/') && req.method === 'GET') {
      const code = decodeURIComponent(pathname.slice('/api/orders/'.length));
      const order = findOrderByCode(db, code);
      if (!order) {
        sendJson(res, 404, {
          error: { code: 'ORDER_NOT_FOUND', message: 'Pesanan dengan kode itu tidak ditemukan.' },
        });
        return;
      }
      sendJson(res, 200, { order });
      return;
    }

    if (pathname === '/api/checkout' && req.method === 'POST') {
      const body = await readJson(req);
      const result = placeOrder(body);
      sendJson(res, result.reused ? 200 : 201, result);
      return;
    }

    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, {
        error: { code: 'NOT_FOUND', message: 'Endpoint API tidak ditemukan.' },
      });
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode tidak didukung.' } });
      return;
    }

    await serveStatic(req, res, pathname);
  } catch (error) {
    if (error instanceof OrderError) {
      sendJson(res, error.status, {
        error: { code: error.code, message: error.message, ...(error.details || {}) },
      });
      return;
    }
    console.error('[api]', error);
    sendJson(res, 500, {
      error: {
        code: 'INTERNAL',
        message: 'Server gagal memproses permintaan. Coba lagi sebentar lagi.',
      },
    });
  }
});

server.listen(port, () => {
  console.log(`BelanjaKu API berjalan di http://localhost:${port}`);
  console.log(`Database: ${dbPath}`);
});

function shutdown() {
  server.close(() => {
    try {
      db.close();
    } catch {
      // sudah tertutup
    }
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
