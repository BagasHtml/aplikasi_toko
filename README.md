# BelanjaKu

Toko barang harian: katalog dengan sisa stok dari database, keranjang, checkout, rincian pesanan, dan bukti pembelian yang bisa dicetak. Frontend React + Vite, API Node, database SQLite.

## Menjalankan

```bash
npm install
npm run dev
```

Web berjalan di `http://localhost:5173`, API di `http://localhost:8787`.

Perintah lain:

```bash
npm run build   # cek tipe lalu build produksi
npm run test    # uji API pesanan, stok, dan race condition
npm run lint
```

## Menambah stok barang

Stok disimpan di tabel `products` pada SQLite (`server/data/toko.sqlite`). Jangan mengedit file ini saat API sedang memproses pesanan. Pakai CLI yang memakai database yang sama:

```bash
npm run stock -- list
npm run stock -- add motor-matic-110 5
npm run stock -- set setrika-uap 12
```

- `add <id> <jumlah>` menambah stok sebanyak jumlah.
- `set <id> <jumlah>` mengganti stok menjadi jumlah tersebut.
- `list` menampilkan semua id dan stok saat ini.

Perubahan langsung dibaca API. Muat ulang halaman katalog atau beranda untuk melihat angka baru. Aplikasi ini tidak punya halaman admin, jadi penambahan stok sengaja hanya lewat CLI, bukan lewat form publik.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
