// One-time script: uploads the local seed photos to Cloudinary and prints
// the resulting URLs, so seed.js can reference real hosted images instead
// of hotlinking Unsplash.
//
// Run with: node upload-seed-images.js
require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const images = [
  { file: 'seed-assets/textbook.jpg', label: 'Textbook' },
  { file: 'seed-assets/charger.jpg', label: 'Charger' }
];

async function run() {
  console.log('Uploading seed images to Cloudinary...\n');

  for (const { file, label } of images) {
    const filePath = path.join(__dirname, file);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'campuscart'
      });
      console.log(`${label}:`);
      console.log(`  URL:        ${result.secure_url}`);
      console.log(`  public_id:  ${result.public_id}\n`);
    } catch (err) {
      console.error(`❌ Failed to upload ${label}:`, err.message);
    }
  }

  console.log('Done. Copy the URL and public_id values above into seed.js.');
  process.exit(0);
}

run();
