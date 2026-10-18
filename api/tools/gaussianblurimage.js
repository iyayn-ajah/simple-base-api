const express = require('express');
const fetch = require('node-fetch');
const sharp = require('sharp');
const fs = require('fs').promises;
const router = express.Router();

router.get('/', async (req, res) => {
  const imgurl = req.query.imgurl;
  const factor = req.query.factor;
  if (!imgurl || !factor) return res.status(400).json({ error: "Missing 'imgurl' or 'factor' parameter" });
  try {
    const bufferyeah = await fetch(imgurl).then((response) => response.buffer());
    const buffernya = await gaussianblurimage(bufferyeah, factor);
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': buffernya.length,
    });
    return res.end(buffernya);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

async function gaussianblurimage(buffer, blurFactor) {
  const parsedFactor = parseFloat(blurFactor);

  if (isNaN(parsedFactor) || parsedFactor < 1 || parsedFactor > 40) {
    throw new RangeError('blurFactor harus berupa angka di antara 1 dan 40.');
  }

  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('Parameter buffer harus berupa instance dari Buffer.');
  }

  return await sharp(buffer)
    .blur(parsedFactor)
    .toBuffer();
}
