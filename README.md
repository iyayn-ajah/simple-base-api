# SIMPLE BASE API USING EXPRESS JS
---------
### 📃 T&Cs
1. Not For Sale!!!
2. Don't forget to star this repo!
3. If you have any issues, please create an issue in this repo.

---------

---------
### 📃 NOTE
There may be a module missing for the scraper. If so, add it to package.json and index.js.
---------

---
# Setting API name etc in index.js
<img id="logoImg" src="https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1766655158167.jpeg" >

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

-----

## 🚀 How to *Deploy* to Vercel

1. Fork this repo
2. Log in to [vercel.com](https://vercel.com) with your GitHub account
3. Add a project and select your forked repo to deploy
4. Just wait for it to be ready
5. Once it's ready, you're free to customize or rename it, but don't forget to credit it

-----
