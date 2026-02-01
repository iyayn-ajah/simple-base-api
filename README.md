# SIMPLE BASE API USING EXPRESS JS
---------
### 📃 T&Cs
1. Not For Sale!!!
2. Don't forget to star this repo!
3. If you have any issues, please create an issue in this repo.

---------

---------
### 📃 NOTE
There may be a module missing for the scraper. If yes, add it to package.json and index.js.

In this repo there are 3 branch 
1. <a href="https://github.com/iyayn-ajah/simple-base-api/tree/main">https://github.com/iyayn-ajah/simple-base-api/tree/main</a>, add manual endpoint documentation to UI. Preview: <a href="https://simple-epiay.vercel.app/">https://simple-epiay.vercel.app/</a>

2. <a href="https://github.com/iyayn-ajah/simple-base-api/tree/autoload-endpoint">https://github.com/iyayn-ajah/simple-base-api/tree/autoload-endpoint</a>, auto load endpoint and automatic added to UI, Preview: <a href="https://base-api-auto-load-endpoint.vercel.app/">https://base-api-auto-load-endpoint.vercel.app/</a>

3. <a href="https://github.com/iyayn-ajah/simple-base-api/tree/setting-api-in-folder">https://github.com/iyayn-ajah/simple-base-api/tree/setting-api-in-folder</a>, setting endpoint in folder like whatsapp bot script plugins + autoload category and endpoint. Preview: <a href="https://base-api-setting-endpoint-in-folder.vercel.app/">https://base-api-setting-endpoint-in-folder.vercel.app/</a>

---------

---
# Setting API name etc
<img id="Eum" src="https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1768109845672.jpeg" >

---
# 🛠️ How to Add Features to index.js
Just follow this code structure:
# json result
```javascript
router.get('/category-name/endpoin-name', async (req, res) => {
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
````
## Example
```javascript
router.get('/downloader/videy', async (req, res) => {
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
```
# for results in file form
```javascript
router.get('/category-name/endpoin-name', async (req, res) => {
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
````
## Example:
```javascript
async function ssweb(url, { width = 1280, height = 720, full_page = false, device_scale = 1 } = {}) {
    try {
        if (!url.startsWith('https://')) throw new Error('Invalid url');
        if (isNaN(width) || isNaN(height) || isNaN(device_scale)) throw new Error('Width, height, and scale must be a number');
        if (typeof full_page !== 'boolean') throw new Error('Full page must be a boolean');
        
        const { data } = await axios.post('https://gcp.imagy.app/screenshot/createscreenshot', {
            url: url,
            browserWidth: parseInt(width),
            browserHeight: parseInt(height),
            fullPage: full_page,
            deviceScaleFactor: parseInt(device_scale),
            format: 'png'
        }, {
            headers: {
                'content-type': 'application/json',
                referer: 'https://imagy.app/full-page-screenshot-taker/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });
        
        return data.fileUrl;
    } catch (error) {
        throw new Error(error.message);
    }
}
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
```
-----

## 📄 How to add API documentation to listapi.json
# Add endpoint documentation with category
```json
{
    "name": "CATEGORY NAME",
    "items": [
        {
            "name": "ENDPOINT",
            "path": "/api/category/endpoint?query=",
            "desc": "Description",
            "status": "ready",
            "params": {
                "query": "Parameter query"
            }
        }
    ]
}
```
# Just add API endpoint documentation
```json
 {
    "name": "ENDPOINT",
    "path": "/api/category/endpoint?query=",
    "desc": "Description",
    "status": "ready",
    "params": {
        "query": "Parameter query"
    }
}
```
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
