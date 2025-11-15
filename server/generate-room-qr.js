const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const connectDB = require('./config/database');
const Room = require('./models/Room');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function main() {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const outDir = path.join(__dirname, 'public', 'qr', 'rooms');
  await ensureDir(outDir);

  await connectDB();

  const rooms = await Room.find({}).sort({ name: 1 });
  if (rooms.length === 0) {
    console.log('No rooms found. Please seed rooms first.');
    process.exit(0);
  }

  console.log(`Generating QR codes for ${rooms.length} rooms...`);
  const normalizeCode = (name) => {
    if (!name) return '';
    // Remove Vietnamese diacritics and non-alphanumeric, uppercase
    let s = name.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
    s = s.toUpperCase();
    // Remove all non-alphanumeric
    s = s.replace(/[^A-Z0-9]/g, '');
    // Shorten PHONG prefix to P
    if (s.startsWith('PHONG')) s = 'P' + s.slice(5);
    return s;
  };
  for (const room of rooms) {
    const rawName = room.name || room.roomNumber || String(room._id).slice(-4);
    const code = normalizeCode(rawName) || String(room._id).slice(-4).toUpperCase();
    const url = `${clientUrl}/menu?room=${encodeURIComponent(code)}`;
    const file = path.join(outDir, `${code}.png`);

    await QRCode.toFile(file, url, {
      width: 600,
      margin: 2,
      color: { dark: '#000000', light: '#ffffffff' }
    });
    console.log(`✓ ${code} -> ${url}`);
  }

  console.log(`QR images saved to: ${outDir}`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


