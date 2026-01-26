const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

/*
For setting API name etc
*/
const title = "EH PI AY DOANG";
const favicon = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg?format=png&name=900x900";
const logo = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg";
const headertitle = "REST EH PI AY";
const headerdescription = "Kumpulan API Endpoint yang mungkin berguna.";
const footer = "© SHIKAKU IYAYN AJAH";

const router = express.Router();
const apiPath = path.join(__dirname, 'api');
const endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());

for (const category of endpointDirs) {
  const categoryPath = path.join(apiPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const routeName = path.basename(file, '.js');
    const route = require(path.join(categoryPath, file));
    router.use(`/${category}/${routeName}`, route);
  }
}


function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  const route = require(path.join(apiPath, category, file));
  const subRouter = route.stack ? route : route.router || route;
  if (!subRouter || !subRouter.stack) return endpoints;
  subRouter.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      let params = {};
      if (layer.route.stack && layer.route.stack.length) {
        layer.route.stack.forEach(mw => {
          const fnString = mw.handle.toString();
          [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            params[match[1]] = "";
          });
          [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            params[match[1]] = "";
          });
        });
      }
      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `/${category}/${file.replace(/\.js$/,"")}`,
        status: "ready",
        params,
        methods
      });
    }
  });
  return endpoints;
}

router.get('/apilist', (req, res) => {
  const categories = [];

  for (const category of endpointDirs) {
    const files = fs.readdirSync(path.join(apiPath, category)).filter(f => f.endsWith('.js'));
    const endpoints = [];
    for (const file of files) {
      endpoints.push(...getEndpointsFromRouter(category, file));
    }
    if (endpoints.length) {
      categories.push({
        name: `${category.toUpperCase()} API ENDPOINT`,
        items: endpoints
      });
    }
  }

  categories.push({
    name: "OTHER",
    items: [
      {
        name: "/apilist",
        path: "/api/apilist",
        desc: "/apilist",
        status: "ready",
        params: {},
        methods: ["GET"]
      }
    ]
  });

  res.json({ categories });
});

app.use('/api', router);

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/linkbio.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'linkbio.json'));
});
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <link id="faviconLink" rel="icon" type="image/x-icon" href="${favicon}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css" />
</head>
<body class="min-h-screen antialiased">
    <div id="toast" class="toast">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <button id="themeToggle" class="theme-toggle-btn" aria-label="Toggle theme">
        <svg id="theme-toggle-dark-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
        <svg id="theme-toggle-light-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
        </svg>
    </button>

    <div class="max-w-5xl mx-auto px-4 py-8">
        <header id="api" class="mb-12">
            <div class="mb-6 flex justify-center">
                <img id="logoImg" src="${logo}" alt="Logo" class="w-full max-w-sm rounded-xl shadow-xl hover:scale-105 transition-all duration-300">
            </div>
            <h1 id="mainTitle" class="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-wider text-center gray-gradient-text">${headertitle}</h1>
            <p id="mainDescription" class="text-lg font-light tracking-wide text-center text-gray-300 light-mode:text-gray-600">${headerdescription}</p>
            
            <div class="mt-8 flex flex-wrap justify-center items-center gap-4 md:gap-8">
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-medium stats-text-secondary">Your Battery</span>
                        <div class="flex items-center gap-2 mt-1">
                            <div id="batteryContainer" class="battery-container">
                                <div id="batteryLevel" class="battery-level bg-green-500" style="width: 0%"></div>
                                <div class="battery-tip"></div>
                            </div>
                            <div class="flex flex-col items-start">
                                <span id="batteryPercentage" class="text-sm font-bold">0%</span>
                                <span id="batteryStatus" class="battery-status-text stats-text-secondary">Detecting...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-medium stats-text-secondary">Total Endpoints</span>
                        <span id="totalEndpoints" class="text-lg font-bold">0</span>
                    </div>
                </div>
                
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-medium stats-text-secondary">Total Categories</span>
                        <span id="totalCategories" class="text-lg font-bold">0</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 h-1 w-32 mx-auto bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 rounded-full"></div>
        </header>

        <div class="mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Search endpoints by name, path, or category..."
                    class="search-input w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-blue-500 transition-all code-font"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 class="text-sm font-bold mb-1">No endpoints found</h3>
            <p class="text-xs">Try a different search term</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <section id="social" class="mt-12 pt-8 border-t border-gray-700 light-mode:border-gray-300">
            <div id="socialContainer" class="flex flex-wrap justify-center gap-3">
                <div id="socialLoading" class="text-center py-4 w-full">
                    <div class="spinner mx-auto"></div>
                    <p class="text-sm mt-3 text-gray-500">Loading link bio...</p>
                </div>
                <div id="socialError" class="text-center py-4 w-full hidden">
                    <div class="text-4xl mb-2">⚠️</div>
                    <h3 class="text-sm font-bold mb-1">Link bio not available</h3>
                    <p class="text-xs">Please create <code>linkbio.json</code> file first</p>
                    <p class="text-xs mt-2 text-gray-500">Required format: {"link_bio": [{"name": "...", "url": "..."}]}</p>
                </div>
            </div>
        </section>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-gray-700 light-mode:border-gray-300 text-center text-xs">
            ${footer}
        </footer>
    </div>
<script src="script.js"></script>
</body>
</html>
    `);
});

app.use('/api', router);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
