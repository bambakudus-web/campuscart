// One-time script: migrate specific local listings + their sellers to production.
//
// Usage (run from backend/, same folder as seed.js):
//
//   PROD_DB_HOST=tokaido.proxy.rlwy.net \
//   PROD_DB_PORT=12120 \
//   PROD_DB_USER=root \
//   PROD_DB_PASSWORD=your_prod_password \
//   PROD_DB_NAME=railway \
//   node migrate-to-production.js
//
// It reads LOCAL connection details from your existing .env (DB_HOST etc),
// same as seed.js does. Your local .env is not modified.
//
// Safe to re-run: users are matched by email, listings are matched by
// (title, seller_id) on the production side, so nothing gets duplicated
// if you run it twice or if seed.js already created an overlapping row.

require('dotenv').config();
const mysql = require('mysql2/promise');

// Which local listing IDs to bring over. Adjust if needed.
const LISTING_IDS = [3, 4, 5, 6, 7, 8];

async function main() {
  const requiredProdVars = ['PROD_DB_HOST', 'PROD_DB_PORT', 'PROD_DB_USER', 'PROD_DB_PASSWORD', 'PROD_DB_NAME'];
  const missing = requiredProdVars.filter((v) => !process.env[v]);
  if (missing.length) {
    console.error(`❌ Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  const local = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const prod = await mysql.createConnection({
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME
  });

  try {
    console.log(`Fetching local listings: ${LISTING_IDS.join(', ')}`);

    const [listings] = await local.query(
      `SELECT l.*, u.name AS seller_name, u.email AS seller_email,
              u.password_hash AS seller_password_hash, u.phone AS seller_phone,
              u.role AS seller_role
       FROM listings l
       JOIN users u ON u.id = l.seller_id
       WHERE l.id IN (?)`,
      [LISTING_IDS]
    );

    if (listings.length === 0) {
      console.log('No matching listings found locally. Nothing to do.');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const row of listings) {
      // 1. Find or create the seller in production, matched by email.
      const [existingUsers] = await prod.query('SELECT id FROM users WHERE email = ?', [row.seller_email]);

      let prodSellerId;
      if (existingUsers.length > 0) {
        prodSellerId = existingUsers[0].id;
      } else {
        const [insertResult] = await prod.query(
          `INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [row.seller_name, row.seller_email, row.seller_password_hash, row.seller_phone, row.seller_role]
        );
        prodSellerId = insertResult.insertId;
        console.log(`  + created seller "${row.seller_email}" in production (id ${prodSellerId})`);
      }

      // 2. Find or create the listing in production, matched by (title, seller_id).
      const [existingListings] = await prod.query(
        'SELECT id FROM listings WHERE title = ? AND seller_id = ?',
        [row.title, prodSellerId]
      );

      if (existingListings.length > 0) {
        console.log(`  ~ skipped "${row.title}" (already exists in production, id ${existingListings[0].id})`);
        skippedCount++;
        continue;
      }

      const [listingResult] = await prod.query(
        `INSERT INTO listings
           (title, description, price, category, item_condition, status,
            image_url, image_public_id, seller_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          row.title,
          row.description,
          row.price,
          row.category,
          row.item_condition,
          row.status,
          row.image_url,
          row.image_public_id,
          prodSellerId
        ]
      );

      console.log(`  ✓ migrated "${row.title}" -> production listing id ${listingResult.insertId}`);
      migratedCount++;
    }

    console.log(`\n✅ Done. Migrated: ${migratedCount}, skipped (already present): ${skippedCount}`);
  } finally {
    await local.end();
    await prod.end();
  }
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
