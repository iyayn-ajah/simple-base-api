const express = require('express');
const path = require('path');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');
const { GoogleGenAI } = require('@google/genai');
const { fromBuffer } = require('file-type');
const axios = require("axios");
const FormData = require("form-data");
const { transcriptyt } = require('./lib/youtubetranscript.js');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/iyah.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'iyah.json'));
});

// AI ENDPOINT
router.get('/ai/gemini', async (req, res) => {
  const text = req.query.text;
  const apikey = req.query.apikey;
  if (!text || !apikey) return res.status(400).json({ error: "Missing 'text' or 'apikey' parameter" });
  try {
    const ai = new GoogleGenAI({ apiKey: `${apikey}` });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${text}`
    });
    const replyText = response?.text ?? response?.output?.[0]?.content ?? JSON.stringify(response);
    return res.json({ text: replyText });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// DOWNLOADER ENDPOINT
router.get('/downloader/videy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });

  try {
    const videoId = url.split("=")[1];
    if (!videoId) return res.status(400).json({ error: "Invalid 'url' parameter" });
    const anunyah = `https://cdn.videy.co/${videoId}.mp4`;
    return res.json({ fileurl: anunyah });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.get('/downloader/pixeldrain', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" }); 
  try {
    const fileId = url.split('/').pop();  
    const response = await axios.get(`https://pixeldrain.com/api/file/${fileId}/info`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
      }
    });    
    const data = response.data;  
    if (!data.name) {
      return res.status(404).json({ error: "Pixeldrain file not found or invalid title" });
    }   
    return res.json({
      filename: data.name,
      fileurl: `https://pixeldrain.com/api/file/${fileId}`
    });    
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// TOOLS ENDPOINT 
router.get('/tools/imagetools', async (req, res) => {
  const imgurl = req.query.imgurl;
  const type = req.query.type;
  if (!imgurl || !type) return res.status(400).json({ error: "Missing imgurl or type parameter. List type: 'removebg', 'enhance', 'upscale', 'restore', 'colorize'" });
  try {
  const bufferyeah = await fetch(imgurl).then((response) => response.buffer());
  const form = new FormData();
    form.append("file", bufferyeah, "image.png");
    form.append("type", type);

    const { data } = await axios.post(
      "https://imagetools.rapikzyeah.biz.id/upload",
      form,
      {
        headers: form.getHeaders(),
      }
    );
    const dom = new JSDOM(data);
    const resultImg = dom.window.document.querySelector("#result");

    if (!resultImg) throw new Error("Gagal menemukan elemen <img id='result'>");

    const resultpic = resultImg.getAttribute("src");
    if (!resultpic) throw new Error("URL hasil tidak ditemukan");
const buffernya = await fetch(resultpic).then((response) => response.buffer());
res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': buffernya.length,
            });
res.end(buffernya);
 } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.get('/tools/yt-transcript', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });
  try {
    const anunyah = await transcriptyt(url);
    return res.json(anunyah);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.use('/api', router);

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
