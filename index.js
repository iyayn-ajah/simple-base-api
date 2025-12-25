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
/*
UNTUK SETTING NAMA WEB DLL
*/
const title = "EH PI AY DOANG";
const favicon = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg?format=png&name=900x900";
const logo = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg";
const headertitle = "REST EH PI AY";
const headerdescription = "Kumpulan API Endpoint yang mungkin berguna.";
const footer = "© 2025 IYAYN AJAH";

/*
Nah yang di bawah ini fiturnyah
*/
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
    <style>
    /* Smooth transitions */
    * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
    }

    /* Default dark mode */
    :root {
        --bg-primary: #000000;
        --bg-secondary: #111111;
        --bg-tertiary: #1a1a1a;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --text-tertiary: #888888;
        --border-color: #333333;
        --scrollbar-thumb: #444444;
        --scrollbar-track: #111111;
        --card-bg: #111827;
        --input-bg: #1f2937;
        --method-badge: #374151;
        --social-bg: #1f2937;
        --social-text: #ffffff;
        --social-hover: #374151;
        --stats-bg: #111111;
        --stats-border: #333333;
        --stats-text: #ffffff;
        --stats-text-secondary: #cccccc;
    }

    /* Light mode variables */
    .light-mode {
        --bg-primary: #ffffff;
        --bg-secondary: #f3f4f6;
        --bg-tertiary: #f9fafb;
        --text-primary: #000000;
        --text-secondary: #374151;
        --text-tertiary: #6b7280;
        --border-color: #d1d5db;
        --scrollbar-thumb: #cbd5e0;
        --scrollbar-track: #f3f4f6;
        --card-bg: #ffffff;
        --input-bg: #f9fafb;
        --method-badge: #e5e7eb;
        --social-bg: #f3f4f6;
        --social-text: #374151;
        --social-hover: #e5e7eb;
        --stats-bg: #ffffff;
        --stats-border: #e5e7eb;
        --stats-text: #1f2937;
        --stats-text-secondary: #6b7280;
    }

    body {
        font-family: 'Space Grotesk', sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        min-height: 100vh;
    }

    /* Custom scrollbar */
    * {
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
    }
    *::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    *::-webkit-scrollbar-track {
        background: var(--scrollbar-track);
    }
    *::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 10px;
    }
    *::-webkit-scrollbar-thumb:hover {
        background: var(--text-tertiary);
    }

    /* Card hover effect */
    .card-hover {
        transition: all 0.3s ease-in-out;
    }

    .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    /* Theme toggle button */
    .theme-toggle-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
    }

    .theme-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    /* Loading overlay */
    .loading-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(5px);
        z-index: 9999;
    }

    .light-mode .loading-overlay {
        background: rgba(255, 255, 255, 0.9);
    }

    .loading-overlay.active {
        display: flex;
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(100, 100, 100, 0.3);
        border-top-color: var(--text-tertiary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Toast notification */
    .toast {
        position: fixed;
        top: 24px;
        right: 24px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        padding: 16px 20px;
        border-radius: 12px;
        color: var(--text-primary);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
        opacity: 0.95;
    }

    .toast.show {
        transform: translateX(0);
    }

    /* Social badge */
    .social-badge {
        transition: all 0.3s ease;
        background: var(--social-bg);
        color: var(--social-text);
    }

    .social-badge:hover {
        transform: scale(1.05);
        opacity: 0.9;
        background: var(--social-hover);
    }

    /* Audio player */
    audio {
        border-radius: 30px;
        padding: 5px;
        width: 100%;
        background: var(--input-bg);
    }

    /* Media preview styles */
    .media-preview {
        width: 100%;
        max-width: 100%;
        border-radius: 8px;
        overflow: hidden;
    }
    .media-iframe {
        width: 100%;
        height: 400px;
        border: none;
        border-radius: 8px;
    }
    .media-image {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
    }

    /* Gray gradient text */
    .gray-gradient-text {
        background: linear-gradient(-45deg, var(--text-primary), var(--text-secondary), var(--text-tertiary), #666666);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 300% 300%;
        animation: gradient 3s ease infinite;
    }

    @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* Code font */
    .code-font {
        font-family: 'JetBrains Mono', monospace;
    }

    /* Search input */
    .search-input {
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
    }

    .search-input::placeholder {
        color: var(--text-tertiary);
    }

    /* Method badge */
    .method-badge {
        background: var(--method-badge);
        color: var(--text-primary);
    }

    /* Status badges */
    .status-ready {
        background: rgba(34, 197, 94, 0.2);
        color: rgb(34, 197, 94);
        border: 1px solid rgba(34, 197, 94, 0.4);
    }

    .status-update {
        background: rgba(234, 179, 8, 0.2);
        color: rgb(234, 179, 8);
        border: 1px solid rgba(234, 179, 8, 0.4);
    }

    .status-error {
        background: rgba(239, 68, 68, 0.2);
        color: rgb(239, 68, 68);
        border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .status-warning {
        background: rgba(234, 179, 8, 0.1);
        border: 1px solid rgba(234, 179, 8, 0.3);
        color: var(--text-secondary);
    }

    /* Battery indicator */
    .battery-container {
        position: relative;
        width: 40px;
        height: 18px;
        border: 2px solid currentColor;
        border-radius: 4px;
        overflow: hidden;
    }

    .light-mode .battery-container {
        border-color: #6b7280;
    }

    .battery-level {
        height: 100%;
        border-radius: 2px;
        transition: width 0.5s ease;
    }

    .battery-tip {
        position: absolute;
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 8px;
        background-color: currentColor;
        border-radius: 0 2px 2px 0;
    }

    .light-mode .battery-tip {
        background-color: #6b7280;
    }

    /* Battery charging animation */
    .battery-charging {
        animation: pulseCharge 2s infinite;
    }

    @keyframes pulseCharge {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    .battery-container.charging::before {
        content: "⚡";
        position: absolute;
        right: -25px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        animation: blink 1s infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    /* Fade in animation */
    .fade-in {
        animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Battery status text */
    .battery-status-text {
        font-size: 9px;
        opacity: 0.8;
        margin-top: 2px;
    }

    /* Stats cards */
    .stats-card {
        background: var(--stats-bg);
        border: 1px solid var(--stats-border);
        color: var(--stats-text);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stats-text-secondary {
        color: var(--stats-text-secondary);
    }

    /* small responsive tweaks */
    @media (max-width: 640px) {
        .theme-toggle-btn { width: 52px; height: 52px; bottom: 16px; right: 16px; }
    }
    </style>
</head>
<body class="min-h-screen antialiased">
    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay items-center justify-center">
        <div class="text-center">
            <div class="spinner mx-auto mb-4"></div>
            <p class="font-semibold">Processing...</p>
        </div>
    </div>

    <!-- Toast -->
    <div id="toast" class="toast">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <!-- Theme Toggle Button -->
    <button id="themeToggle" class="theme-toggle-btn" aria-label="Toggle theme">
        <!-- Moon icon (dark mode) -->
        <svg id="theme-toggle-dark-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
        <!-- Sun icon (light mode) -->
        <svg id="theme-toggle-light-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
        </svg>
    </button>

    <div class="max-w-5xl mx-auto px-4 py-8">
        <!-- Header -->
        <header id="api" class="mb-12">
            <div class="mb-6 flex justify-center">
                <img id="logoImg" src="${logo}" alt="Logo" class="w-full max-w-sm rounded-xl shadow-xl hover:scale-105 transition-all duration-300">
            </div>
            <h1 id="mainTitle" class="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-wider text-center gray-gradient-text">${headertitle}</h1>
            <p id="mainDescription" class="text-lg font-light tracking-wide text-center text-gray-300 light-mode:text-gray-600">${headerdescription}</p>
            
            <!-- User Battery & Total Endpoints & Total Category Stats -->
            <div class="mt-8 flex flex-wrap justify-center items-center gap-4 md:gap-8">
                <!-- Battery Card -->
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
                
                <!-- Total Endpoints Card -->
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-medium stats-text-secondary">Total Endpoints</span>
                        <span id="totalEndpoints" class="text-lg font-bold">0</span>
                    </div>
                </div>
                
                <!-- Total Category Card -->
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span class="text-xs font-medium stats-text-secondary">Total Categories</span>
                        <span id="totalCategories" class="text-lg font-bold">0</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 h-1 w-32 mx-auto bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 rounded-full"></div>
        </header>

        <!-- Search -->
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

        <!-- No Results -->
        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 class="text-sm font-bold mb-1">No endpoints found</h3>
            <p class="text-xs">Try a different search term</p>
        </div>

        <!-- API List -->
        <div id="apiList" class="space-y-4"></div>

        <!-- Social Media Section -->
        <section id="social" class="mt-12 pt-8 border-t border-gray-700 light-mode:border-gray-300">
            <h2 class="text-lg font-bold mb-6 text-center gray-gradient-text">Source Code:</h2>
            <div id="socialContainer" class="flex flex-wrap justify-center gap-3">
                <a href="https://github.com/iyayn-ajah/simple-base-api" target="_blank" class="social-badge">
                    <div class="px-4 py-2 rounded-lg text-sm transition-colors">
                        Source Code
                    </div>
                </a>
            </div>
        </section>

        <!-- Footer -->
        <footer id="siteFooter" class="mt-12 pt-6 border-t border-gray-700 light-mode:border-gray-300 text-center text-xs">
            ${footer}
        </footer>
    </div>

    <script>
    // Theme toggle (simple)
    const themeBtn = document.getElementById('themeToggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    // Initialize theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light-mode');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
    }

    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-mode');
        const isLight = document.documentElement.classList.contains('light-mode');
        if (isLight) {
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
            localStorage.setItem('theme', 'light');
        } else {
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Optional: simple battery API (if supported)
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const levelEl = document.getElementById('batteryLevel');
            const pctEl = document.getElementById('batteryPercentage');
            const statusEl = document.getElementById('batteryStatus');

            function updateBattery() {
                const pct = Math.round(battery.level * 100) + '%';
                pctEl.innerText = pct;
                levelEl.style.width = pct;
                statusEl.innerText = battery.charging ? 'Charging' : 'Not charging';
                if (battery.charging) {
                    levelEl.classList.add('battery-charging');
                } else {
                    levelEl.classList.remove('battery-charging');
                }
            }
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
        }).catch(() => {
            // ignored
        });
    }
    </script>
</body>
</html>
    `);
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/iyah.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'iyah.json'));
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
