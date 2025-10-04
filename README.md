# SIMPLE BASE API USING EXPRESS JS
---------
### 📃 T&Cs
1. Not For Sale!!!
2. Don't forget to star this repo!
3. If you have any issues, please create an issue in this repo.

---------

---------
### 📃 NOTE
There may be a module missing for the scraper. If so, add it to package.json.
---------

---

# 🛠️ How to Add Features To index.js
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

## 📄 How to add API documentation to index.html
# Add endpoint documentation with category
```html
<section id="category-endpoint" class="glass-morph shadow-xl rounded-3xl p-8 mb-8">
            <h2 class="text-3xl font-black gray-gradient-text border-b-4 border-gray-700/50 pb-4 mb-8 flex items-center justify-center sm:justify-start gap-4">
              API ENDPOINT
            </h2>
           <div class="space-y-4">
                <div class="api-card rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center shadow-md">
                    <p class="text-lg font-bold mb-3 lg:mb-0 lg:mr-4 text-black-200">API ENDPOINT:</p>
                    <div class="flex flex-col lg:flex-row items-center w-full lg:w-auto gap-3">
                        <a id="api-endpoint" href="/api/category/endpoint?text=" class="api-endpoint text-blue-300 hover:text-gray-100 break-all text-sm px-4 py-2 rounded-lg transition-all duration-300" target="_blank">/api/category/endpoint?url=</a>
                        <button onclick="copyUrl('api-endpoint')" class="theme-button text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">Salin</button>
                    </div>
                </div>
            </div>
        </section>
```
# Just add API endpoint documentation
```html
                <div class="api-card rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center shadow-md">
                    <p class="text-lg font-bold mb-3 lg:mb-0 lg:mr-4 text-black-200">API ENDPOINT:</p>
                    <div class="flex flex-col lg:flex-row items-center w-full lg:w-auto gap-3">
                        <a id="api-endpoint" href="/api/category/endpoint?text=" class="api-endpoint text-blue-300 hover:text-gray-100 break-all text-sm px-4 py-2 rounded-lg transition-all duration-300" target="_blank">/api/category/endpoint?url=</a>
                        <button onclick="copyUrl('api-endpoint')" class="theme-button text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">Salin</button>
                    </div>
                </div>
```

**Note:** Make sure to replace `new-api-endpoint` with a unique ID and `/api/category/your-endpoint-name` with your actual API path.

-----

## 🚀 How to *Deploy* to Vercel

1. Fork this repo
2. Log in to [vercel.com](https://vercel.com) with your GitHub account
3. Add a project and select your forked repo to deploy
4. Just wait for it to be ready
5. Once it's ready, you're free to customize or rename it, just don't forget to credit it

-----
