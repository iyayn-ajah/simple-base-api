const express = require('express');
const path = require('path');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');
const { GoogleGenAI } = require('@google/genai');
const { fromBuffer } = require('file-type');
const axios = require("axios");
const FormData = require("form-data");
const { ssweb } = require('./lib/ssweb.js');
const { threads } = require('./lib/threads.js');

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
      model: "gemini-2.5-flash-lite",
      contents: `${text}`
    });
    const replyText = response?.text ?? response?.output?.[0]?.content ?? JSON.stringify(response);
    return res.json({ text: replyText });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.get('/ai/geminiwithsysteminstruction', async (req, res) => {
const text = req.query.text;
  const system = req.query.system;
  const apikey = req.query.apikey;
  if (!text || !system || !apikey) return res.status(400).json({ error: "Missing 'text' or 'system' parameter" });
  try {
    const ai = new GoogleGenAI({ apiKey: `${apikey}` });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `${text}`,
      config: {
        systemInstruction: `${system}`,
      },
    });
    const data = {
      text: response.text
    };
    return res.json(data);
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

router.get('/downloader/threads', async (req, res) => {
const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });
  try {
const anu = await threads(url)
return res.json(anu);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});


// TOOLS ENDPOINT 
router.get('/tools/ssweb-pc', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });
  try {
    const resultpic = await ssweb(url, { width: 1280, height: 720 })
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

router.get('/tools/ssweb-hp', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });
  try {
    const resultpic = await ssweb(url, { width: 720, height: 1280 })
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

app.use('/api', router);

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
