const axios = require('axios')
const express = require('express');
const router = express.Router();

async function threads(url) {
  try {
    const apiUrl = `https://snapthreads.net/api/download?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
        "Referer": "https://snapthreads.net/id",
        "Accept": "*/*",
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    if (response.data && response.data.directLink) {
      return {
        success: true,
        download_url: response.data.directLink
      };
    } else {
      return {
        success: false,
        message: "Gagal mengambil link download.",
        error: response.data
      };
    }
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    return {
      success: false,
      message: "Terjadi kesalahan dalam mengambil data.",
      error: error.response ? error.response.data : error.message
    };
  }
}

router.get('/', async (req, res) => {
const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });
  try {
const anu = await threads(url)
return res.json(anu);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
module.exports = router;


