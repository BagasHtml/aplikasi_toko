import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDb } from './db.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || join(here, 'data', 'toko.sqlite')

const [command, id, rawQty] = process.argv.slice(2)

const USAGE = `Cara pakai:
  node server/stock.mjs list
  node server/stock.mjs add <id-barang> <jumlah>
  node server/stock.mjs set <id-barang> <jumlah>

Contoh:
  node server/stock.mjs add motor-matic-110 5
  node server/stock.mjs set setrika-uap 12
  node server/stock.mjs list`

const db = openDb(dbPath)

try {
  if (!command || command === 'list') {
    const rows = db
      .prepare('SELECT * FROM products ORDER BY category, name')
      .all()
    if (rows.length === 0) {
      console.log('Belum ada barang di database.')
    } else {
      for (const row of rows) {
        const stock = row.stock === 0 ? 'HABIS' : `${row.stock} ${row.unit}`
        console.log(`${row.name}\n  id: ${row.id}  stok: ${stock}`)
      }
    }
  } else if (command === 'add' || command === 'set') {
    if (!id || !rawQty || !/^\d+$/.test(rawQty)) {
      console.error(USAGE)
      process.exitCode = 1
    } else {
      const qty = Number(rawQty)
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)

      if (!product) {
        console.error(`Barang dengan id "${id}" tidak ada. Jalankan "list" untuk melihat id yang tersedia.`)
        process.exitCode = 1
      } else if (command === 'add' && qty === 0) {
        console.error('Jumlah tambahan stok harus lebih dari 0.')
        process.exitCode = 1
      } else {
        const next = command === 'add' ? product.stock + qty : qty
        db.exec('BEGIN IMMEDIATE')
        try {
          db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(next, id)
          db.exec('COMMIT')
        } catch (error) {
          db.exec('ROLLBACK')
          throw error
        }
        console.log(
          `${product.name}: ${product.stock} -> ${next} ${product.unit} (id: ${product.id})`,
        )
      }
    }
  } else {
    console.error(USAGE)
    process.exitCode = 1
  }
} finally {
  db.close()
}
