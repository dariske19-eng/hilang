# Panduan Setup Drizz — Cloudflare Workers (repo: dariske19-eng/drizz-pro)

Cloudflare mendaftarkan projek anda sebagai **Worker** (bukan Pages klasik), sebab
tu dashboard sekat "Variables" untuk projek yang cuma ada fail statik. Struktur
fail dalam ZIP ni dah disesuaikan khas untuk jenis Worker.

## Struktur fail
```
public/
  index.html        ← laman utama Drizz
  404.html           ← halaman ralat custom
  dravixhost.html     ← halaman DravixHost
src/
  index.js            ← Worker utama (urus API + hantar fail statik)
wrangler.jsonc        ← konfigurasi Worker (assets + KV binding)
seed-projects.json    ← data 2 projek sedia ada
```

## Langkah 1 — Buat KV Namespace (kalau belum ada)
1. Dashboard Cloudflare → **Workers & Pages** → tab **KV**
2. **Create a namespace** → nama `DRIZZ_PROJECTS` → Create
3. **Salin ID namespace tu** (rentetan panjang macam `06779da6940b431d...`) — akan diperlukan di Langkah 2
4. Buka namespace tu → **Add entry**:
   - Key: `projects`
   - Value: salin & paste seluruh isi `seed-projects.json`
   - Save

## Langkah 2 — Isi ID KV dalam wrangler.jsonc
1. Buka fail `wrangler.jsonc` dalam ZIP ni
2. Cari baris:
   ```
   "id": "GANTIKAN_DENGAN_ID_NAMESPACE_KV_ANDA"
   ```
3. Gantikan dengan ID sebenar yang disalin di Langkah 1

## Langkah 3 — Push ke repo GitHub anda
1. Buka repo `dariske19-eng/drizz-pro` di GitHub
2. Upload/gantikan fail-fail berikut (guna "Add file → Upload files" di laman web GitHub, senang tanpa perlu command line):
   - `public/index.html`
   - `public/404.html`
   - `public/dravixhost.html`
   - `src/index.js`
   - `wrangler.jsonc`
3. **Penting:** buang/kosongkan fail/folder `functions/` yang lama dalam repo tu kalau ada (dah tak digunakan lagi untuk jenis Worker ni)
4. Commit perubahan

Cloudflare akan auto-detect push baharu ni dan mula build semula (sebab repo dah disambungkan). Anda boleh semak progress di tab **Deployments**.

## Langkah 4 — Tambah kata laluan admin sebagai Secret
Selepas deployment baharu siap (dengan `wrangler.jsonc` + `src/index.js`), Worker
anda bukan lagi "static assets only" — jadi Settings patut dah boleh terima Secret:

1. Projek `drizz` → **Settings** → cari bahagian **Runtime variables and secrets**
2. Tambah:
   - `ADMIN_EMAIL` = `dariskeas@gmail.com` (jenis: **Secret**)
   - `ADMIN_PASSWORD` = `digicomprs` (jenis: **Secret**)
3. Save, kemudian pastikan deploy semula berjaya (Deployments → Retry jika perlu)

Jika masih sekat, cuba tab **Bindings** (top-level tab dalam projek anda) —
sesetengah versi UI Cloudflare letak Secret kat situ juga, berasingan dari Settings.

## Langkah 5 — Sambungkan domain drizzev.web.id
1. Projek `drizz` → tab **Domains**
2. **Add domain** → masukkan `drizzev.web.id`
3. Ikut arahan (kalau domain belum guna nameserver Cloudflare, ia akan minta tukar
   nameserver domain kepada Cloudflare — percuma & automatik)

## Selesai!
- Laman live di `https://drizzev.web.id` (atau `*.workers.dev` sementara sebelum domain disambung)
- Taip perkataan **"admin"** di mana-mana pada laman, atau lawati `https://drizzev.web.id/#admin-login`
- Login dengan email/password admin → tambah/buang projek terus, terpapar untuk semua pelawat

## Kalau nak edit tanpa GitHub web UI (pilihan CLI, untuk masa depan)
Kalau nanti rasa selesa guna command line, boleh install Node.js + Wrangler CLI dan
guna `npx wrangler deploy` terus dari komputer anda — lebih pantas dari upload manual
setiap kali. Bagitahu saya kalau nak panduan ni bila-bila masa.
