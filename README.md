# Preview:
<a href="https://simple-epiay.vercel.app/">https://simple-epiay.vercel.app/</a>

# SIMPLE BASE API USING EXPRESS JS
---------
### 📃 T&Cs
1. Not For Sale!!!
2. Don't forget to star this repo!
3. If you have any issues, please create an issue in this repo.

---------

### 📃 NOTE
There may be a module missing for the scraper. If yes, add it to package.json and index.js.
---------
---
# Structure Map
```
simple-base-api/
├── README.md
├── index.js
├── package.json
├── script.js
├── styles.css
├── linkbio.json
├── vercel.json
└── api
    ├── ai
    │   ├── gemini.js
    │   └── geminiwithsysteminstruction.js
    ├── downloader
    │   ├── x.js
    │   └── videy.js
    └── tools
        ├── ssweb-hp.js
        └── ssweb-pc.js
```

---
# Example setting API name etc in index.js
```javascript
/*
For setting API name etc
*/
const title = "EH PI AY DOANG";
const favicon = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg?format=png&name=900x900";
const logo = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1770044887516.png";
const headertitle = "REST EH PI AY";
const headerdescription = "Kumpulan API Endpoint yang mungkin berguna.";
const footer = "© SHIKAKU IYAYN AJAH";
```

---
# 🛠️ How to Add Features to api
Just follow this code structure:
# json result
```javascript
const express = require('express'); // must be used
const router = express.Router(); // must be used

router.get('/', async (req, res) => {
  const text = req.query.text; // for https://example.com/api?text=
  if (!text) return res.status(400).json({ error: "Missing 'text' parameter" });
  try {
// Your code
const data = {
      result: code result
    };
    return res.json(data); 
} catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router; // must be used
````
## Example
```javascript
// in api/downloader/videy.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });
  try {
    const videoId = url.split("=")[1];
    if (!videoId) return res.status(400).json({ error: "Invalid 'url' parameter" });
    const anunyah = `https://cdn.videy.co/${videoId}.mp4`;
    const data = {
      fileurl: anunyah
    };
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
```
# for results in file form
```javascript
const express = require('express'); // must be used
const router = express.Router(); // must be used

router.get('/', async (req, res) => {
  const text = req.query.text; // for https://example.com/api?text=
  if (!text) return res.status(400).json({ error: "Missing 'text' parameter" });
  try {
// Your code
 const buffer = // buffer result from your code
    res.writeHead(200, {
                'Content-Type': 'mimetype-file'
                'Content-Length': buffer.length,
            });
res.end(buffer);
 } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router; // must be used
````
## Example:
```javascript
// in api/tools/gaussianblurimage.js
const express = require('express');
const fetch = require('node-fetch');
const sharp = require('sharp');
const fs = require('fs').promises;
const router = express.Router();

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
```
-----

## 📄 How to add link bio to linkbio.json
```json
{
      "name": "Name bio",
      "url": "link bio"
}
```

## Example
```json
{
      "name": "Facebook",
      "url": "https://web.facebook.com/shikakuiyayn"
}
```
-----

## 🚀 How to *Deploy* to Vercel

1. Fork this repo
2. Log in to [vercel.com](https://vercel.com) with your GitHub account
3. Add a project and select your forked repo to deploy
4. Just wait for it to be ready
5. Once it's ready, you're free to customize or rename it, but don't forget to credit it

-----
