const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let allApiElements = [];
let totalEndpoints = 0;
let totalCategories = 0;
let batteryMonitor = null;
let scrollPosition = 0;

// Fungsi untuk menonaktifkan scroll
function disableScroll() {
    // Simpan posisi scroll saat ini
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Tambah class no-scroll ke body
    document.body.classList.add('no-scroll');
    document.body.style.top = `-${scrollPosition}px`;
}

// Fungsi untuk mengaktifkan scroll kembali
function enableScroll() {
    // Hapus class no-scroll dari body
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    
    // Kembalikan posisi scroll
    window.scrollTo(0, scrollPosition);
}

// Fungsi tema
const themeToggleBtn = document.getElementById('themeToggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
const body = document.body;

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggleDarkIcon.classList.add('hidden');
        themeToggleLightIcon.classList.remove('hidden');
        console.log('Light mode activated');
    } else {
        body.classList.remove('light-mode');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
        console.log('Dark mode activated');
    }
    
    // Update social media badges immediately
    updateSocialBadges();
}

function toggleTheme() {
    if (body.classList.contains('light-mode')) {
        // Switch to dark mode
        body.classList.remove('light-mode');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
        currentTheme = 'dark';
        console.log('Switched to dark mode');
    } else {
        // Switch to light mode
        body.classList.add('light-mode');
        themeToggleDarkIcon.classList.add('hidden');
        themeToggleLightIcon.classList.remove('hidden');
        currentTheme = 'light';
        console.log('Switched to light mode');
    }
    
    localStorage.setItem('theme', currentTheme);
    
    // Update social media badges
    updateSocialBadges();
    
    // Muat ulang API dengan tema yang sesuai
    if (apiData) {
        loadApis();
    }
}

// Function to update social badges based on theme
function updateSocialBadges() {
    const isLightMode = body.classList.contains('light-mode');
    const socialBadges = document.querySelectorAll('.social-badge > div');
    
    socialBadges.forEach(badge => {
        // Clear previous classes
        badge.className = 'px-4 py-2 rounded-lg text-sm transition-colors';
        
        // Add theme-specific classes
        if (isLightMode) {
            badge.classList.add('bg-gray-100', 'text-gray-800', 'hover:bg-gray-200');
        } else {
            badge.classList.add('bg-gray-800', 'text-gray-300', 'hover:bg-gray-700');
        }
    });
}

// Fungsi untuk mendeteksi dan menampilkan baterai pengguna secara real
function initBatteryDetection() {
    const batteryLevelElement = document.getElementById('batteryLevel');
    const batteryPercentageElement = document.getElementById('batteryPercentage');
    const batteryStatusElement = document.getElementById('batteryStatus');
    const batteryContainer = document.getElementById('batteryContainer');
    
    // Cek apakah Battery Status API tersedia
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            // Fungsi untuk update tampilan baterai
            function updateBatteryInfo() {
                const level = battery.level * 100;
                const isCharging = battery.charging;
                const roundedLevel = Math.round(level);
                const isLightMode = body.classList.contains('light-mode');
                
                // Update persentase
                batteryPercentageElement.textContent = `${roundedLevel}%`;
                batteryLevelElement.style.width = `${level}%`;
                
                // Update warna berdasarkan level dan tema
                if (level > 60) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-green-600' : 'bg-green-500');
                } else if (level > 20) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-yellow-600' : 'bg-yellow-500');
                } else {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-red-600' : 'bg-red-500');
                }
                
                // Update status charging
                if (isCharging) {
                    batteryContainer.classList.add('charging');
                    batteryStatusElement.textContent = 'Charging';
                    batteryLevelElement.classList.add('battery-charging');
                } else {
                    batteryContainer.classList.remove('charging');
                    batteryLevelElement.classList.remove('battery-charging');
                    
                    if (battery.dischargingTime === Infinity) {
                        batteryStatusElement.textContent = 'Fully charged';
                    } else {
                        batteryStatusElement.textContent = 'Discharging';
                    }
                }
                
                // Update status dengan waktu estimasi
                if (isCharging && battery.chargingTime !== Infinity) {
                    const hours = Math.floor(battery.chargingTime / 3600);
                    const minutes = Math.floor((battery.chargingTime % 3600) / 60);
                    batteryStatusElement.textContent = `Charging (${hours}h ${minutes}m)`;
                } else if (!isCharging && battery.dischargingTime !== Infinity) {
                    const hours = Math.floor(battery.dischargingTime / 3600);
                    const minutes = Math.floor((battery.dischargingTime % 3600) / 60);
                    batteryStatusElement.textContent = `${hours}h ${minutes}m left`;
                }
                
                // Update status di console (opsional, untuk debugging)
                console.log(`Real Battery: ${roundedLevel}% | Charging: ${isCharging}`);
            }
            
            // Update pertama kali
            updateBatteryInfo();
            
            // Event listener untuk perubahan
            battery.addEventListener('levelchange', updateBatteryInfo);
            battery.addEventListener('chargingchange', updateBatteryInfo);
            battery.addEventListener('chargingtimechange', updateBatteryInfo);
            battery.addEventListener('dischargingtimechange', updateBatteryInfo);
            
            // Simpan reference untuk cleanup
            batteryMonitor = battery;
            
        }).catch(function(error) {
            console.error("Battery API error:", error);
            batteryStatusElement.textContent = 'API Error';
            fallbackBattery();
        });
    } else {
        console.log("Battery Status API not supported");
        batteryStatusElement.textContent = 'API Not Supported';
        fallbackBattery();
    }
    
    // Fallback jika Battery API tidak tersedia
    function fallbackBattery() {
        console.log("Using battery simulation");
        batteryStatusElement.textContent = 'Simulated';
        
        // Coba dapatkan dari localStorage jika ada
        let simulatedLevel = localStorage.getItem('simulatedBattery');
        if (!simulatedLevel) {
            // Generate level awal yang realistis
            simulatedLevel = Math.floor(Math.random() * 30) + 30; // 30-60%
            localStorage.setItem('simulatedBattery', simulatedLevel.toString());
        } else {
            simulatedLevel = parseInt(simulatedLevel);
        }
        
        let isSimulatedCharging = localStorage.getItem('simulatedCharging') === 'true';
        
        // Fungsi simulasi
        function simulateBattery() {
            const isLightMode = body.classList.contains('light-mode');
            let newLevel = simulatedLevel;
            
            if (isSimulatedCharging) {
                // Mode charging: tambah baterai
                const chargeRate = 0.5; // 0.5% per interval
                newLevel = Math.min(100, newLevel + chargeRate);
                
                // Jika sudah full, berhenti charging
                if (newLevel >= 100) {
                    isSimulatedCharging = false;
                    localStorage.setItem('simulatedCharging', 'false');
                    batteryContainer.classList.remove('charging');
                    batteryLevelElement.classList.remove('battery-charging');
                    batteryStatusElement.textContent = 'Fully charged';
                } else {
                    batteryStatusElement.textContent = 'Charging';
                }
            } else {
                // Mode discharging: kurangi baterai
                const drainRate = 0.1; // 0.1% per interval
                newLevel = Math.max(5, newLevel - drainRate); // Minimal 5%
                
                // Jika baterai terlalu rendah, mulai charging
                if (newLevel <= 15 && Math.random() > 0.7) {
                    isSimulatedCharging = true;
                    localStorage.setItem('simulatedCharging', 'true');
                    batteryContainer.classList.add('charging');
                    batteryLevelElement.classList.add('battery-charging');
                    batteryStatusElement.textContent = 'Charging';
                } else {
                    // Hitung waktu tersisa (estimasi)
                    const minutesLeft = Math.round((newLevel - 5) / drainRate);
                    const hours = Math.floor(minutesLeft / 60);
                    const minutes = minutesLeft % 60;
                    
                    if (hours > 0) {
                        batteryStatusElement.textContent = `${hours}h ${minutes}m left`;
                    } else {
                        batteryStatusElement.textContent = `${minutes}m left`;
                    }
                }
            }
            
            // Simpan level baru
            simulatedLevel = newLevel;
            localStorage.setItem('simulatedBattery', newLevel.toString());
            
            // Update tampilan
            const roundedLevel = Math.round(newLevel);
            batteryPercentageElement.textContent = `${roundedLevel}%`;
            batteryLevelElement.style.width = `${newLevel}%`;
            
            // Update warna berdasarkan tema
            if (newLevel > 60) {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-green-600' : 'bg-green-500');
            } else if (newLevel > 20) {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-yellow-600' : 'bg-yellow-500');
            } else {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-red-600' : 'bg-red-500');
            }
            
            console.log(`Simulated Battery: ${roundedLevel}% | Charging: ${isSimulatedCharging}`);
        }
        
        // Jalankan simulasi pertama kali
        simulateBattery();
        
        // Update setiap 10 detik
        setInterval(simulateBattery, 10000);
    }
}

// Cleanup function untuk battery monitor
function cleanupBatteryMonitor() {
    if (batteryMonitor) {
        batteryMonitor.removeEventListener('levelchange', updateBatteryInfo);
        batteryMonitor.removeEventListener('chargingchange', updateBatteryInfo);
        batteryMonitor.removeEventListener('chargingtimechange', updateBatteryInfo);
        batteryMonitor.removeEventListener('dischargingtimechange', updateBatteryInfo);
        batteryMonitor = null;
    }
}

// Function to update total endpoints
function updateTotalEndpoints() {
    const totalEndpointsElement = document.getElementById('totalEndpoints');
    totalEndpointsElement.textContent = totalEndpoints;
}

// Function to update total categories
function updateTotalCategories() {
    const totalCategoriesElement = document.getElementById('totalCategories');
    totalCategoriesElement.textContent = totalCategories;
}

function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    disableScroll(); // Nonaktifkan scroll sebelum menampilkan loading
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('active');
    setTimeout(() => {
        enableScroll(); // Aktifkan scroll setelah loading hilang
    }, 100);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMessage.textContent = message;
    
    if (isError) {
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>';
    } else {
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>';
    }
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function copyText(text, type = 'path') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${type} copied to clipboard!`);
    }).catch(() => {
        showToast('Failed to copy', true);
    });
}

function toggleCategory(index) {
    const content = document.getElementById(`cat-${index}`);
    const icon = document.getElementById(`cat-icon-${index}`);
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function toggleEndpoint(catIdx, epIdx) {
    const content = document.getElementById(`ep-${catIdx}-${epIdx}`);
    const icon = document.getElementById(`ep-icon-${catIdx}-${epIdx}`);
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Function to determine if a URL is a media file
function isMediaFile(url) {
    const mediaExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico',
        '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv',
        '.mp3', '.wav', '.ogg', '.m4a', '.flac',
        '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'
    ];
    
    return mediaExtensions.some(ext => 
        url.toLowerCase().includes(ext) || 
        url.toLowerCase().startsWith('data:image/') ||
        url.toLowerCase().startsWith('data:video/') ||
        url.toLowerCase().startsWith('data:audio/')
    );
}

// Function to determine content type
function getContentType(url, contentType) {
    if (contentType) {
        if (contentType.includes('image/')) return 'image';
        if (contentType.includes('video/')) return 'video';
        if (contentType.includes('audio/')) return 'audio';
        if (contentType.includes('application/pdf')) return 'pdf';
    }
    
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || 
        url.includes('.gif') || url.includes('.webp') || url.includes('.svg')) {
        return 'image';
    }
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || 
        url.includes('.mov') || url.includes('.avi')) {
        return 'video';
    }
    if (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg') || 
        url.includes('.m4a')) {
        return 'audio';
    }
    if (url.includes('.pdf')) return 'pdf';
    
    return 'unknown';
}

// Function to create media preview
function createMediaPreview(url, contentType) {
    const type = getContentType(url, contentType);
    let previewHtml = '';
    
    switch(type) {
        case 'image':
            previewHtml = `
                <div class="media-preview">
                    <img src="${url}" class="media-image" alt="Response Image">
                </div>
            `;
            break;
            
        case 'video':
            previewHtml = `
                <div class="media-preview">
                    <video controls class="media-iframe">
                        <source src="${url}" type="${contentType || 'video/mp4'}">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
            break;
            
        case 'audio':
            previewHtml = `
                <div class="media-preview">
                    <audio controls class="w-full">
                        <source src="${url}" type="${contentType || 'audio/mpeg'}">
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            `;
            break;
            
        case 'pdf':
            previewHtml = `
                <div class="media-preview">
                    <iframe src="${url}" class="media-iframe" frameborder="0"></iframe>                            
 </div>
            `;
            break;
            
        default:
            previewHtml = `
                <div class="media-preview">
                    <iframe src="${url}" class="media-iframe" frameborder="0"></iframe>                            
 </div>
            `;
    }
    
    return previewHtml;
}

async function executeRequest(e, catIdx, epIdx, method, path) {
    e.preventDefault();
    
    if (isRequestInProgress) {
        showToast('Please wait for current request', true);
        return;
    }

    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    const responseContent = document.getElementById(`response-content-${catIdx}-${epIdx}`);
    const curlSection = document.getElementById(`curl-section-${catIdx}-${epIdx}`);
    const curlCommand = document.getElementById(`curl-command-${catIdx}-${epIdx}`);
    const executeBtn = form.querySelector('button[type="submit"]');
    
    executeBtn.disabled = true;
    
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }

    const fullPath = `${BASE_URL}${path.split('?')[0]}?${params.toString()}`;
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div class="spinner mx-auto"></div>';
    
    const curlText = `curl -X ${method} "${fullPath}"`;
    curlCommand.textContent = curlText;
    curlSection.classList.remove('hidden');
    
    isRequestInProgress = true;
    showLoading(); // Ini akan disable scroll

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(fullPath, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get("content-type");
        
        if (contentType?.includes("application/json")) {
            const data = await response.json();
            responseContent.innerHTML = `<pre class="code-font text-sm overflow-auto">${JSON.stringify(data, null, 2)}</pre>`;
        } else if (contentType?.startsWith("image/")) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = createMediaPreview(imageUrl, contentType);
        } else if (contentType?.startsWith("video/")) {
            const blob = await response.blob();
            const videoUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = createMediaPreview(videoUrl, contentType);
        } else if (contentType?.startsWith("audio/")) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = createMediaPreview(audioUrl, contentType);
        } else if (contentType?.includes("application/pdf")) {
            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = createMediaPreview(pdfUrl, contentType);
        } else {
            const text = await response.text();
            
            if (isMediaFile(text)) {
                responseContent.innerHTML = createMediaPreview(text, contentType);
            } else {
                responseContent.innerHTML = `<pre class="code-font text-sm overflow-auto">${text}</pre>`;
            }
        }
        
        showToast('Request completed successfully!');
        
    } catch (error) {
        clearTimeout(timeoutId);
        const errorMsg = error.name === 'AbortError' ? 'Request timeout (30s)' : error.message;
        responseContent.innerHTML = `<pre class="text-red-400 code-font text-sm">Error: ${errorMsg}</pre>`;
        showToast('Request failed!', true);
        
    } finally {
        isRequestInProgress = false;
        hideLoading(); // Ini akan enable scroll kembali
        executeBtn.disabled = false;
    }
}

function clearResponse(catIdx, epIdx) {
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    const curlSection = document.getElementById(`curl-section-${catIdx}-${epIdx}`);
    responseDiv.classList.add('hidden');
    curlSection.classList.add('hidden');
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiData || !apiData.categories) {
        apiList.innerHTML = '<p class="text-center">No API data loaded.</p>';
        return;
    }
    
    const isLightMode = body.classList.contains('light-mode');
    
    // Calculate total endpoints and categories
    totalEndpoints = 0;
    totalCategories = apiData.categories.length;
    
    apiData.categories.forEach(category => {
        totalEndpoints += category.items.length;
    });
    
    // Update total endpoints display
    updateTotalEndpoints();
    
    // Update total categories display
    updateTotalCategories();
    
    let html = '';
    apiData.categories.forEach((category, catIdx) => {
        html += `
        <div class="category-group fade-in" data-category="${category.name.toLowerCase()}">
            <div class="${isLightMode ? 'bg-white border-gray-300' : 'bg-gray-900 border-gray-700'} border rounded-xl overflow-hidden card-hover">
                <button onclick="toggleCategory(${catIdx})" class="w-full px-4 py-3 flex items-center justify-between ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} transition-colors">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">📁</span>
                        <div class="text-left">
                            <h3 class="font-bold text-sm gray-gradient-text">${category.name}</h3>
                            <p class="text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'}">${category.items.length} endpoints</p>
                        </div>
                    </div>
                    <svg id="cat-icon-${catIdx}" class="w-4 h-4 ${isLightMode ? 'text-gray-600' : 'text-gray-400'} transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                
                <div id="cat-${catIdx}" class="hidden">`;
        
        category.items.forEach((item, epIdx) => {
            const method = 'GET';
            const pathParts = item.path.split('?');
            const path = pathParts[0];
            const queryParams = new URLSearchParams(pathParts[1] || '');

            let statusClass = 'status-ready';
            if (item.status === 'update') statusClass = 'status-update';
            if (item.status === 'error') statusClass = 'status-error';

            html += `
            <div class="api-item border-t ${isLightMode ? 'border-gray-300' : 'border-gray-700'}" 
                data-method="${method}"
                data-path="${path}"
                data-alias="${item.name.toLowerCase()}"
                data-description="${item.desc.toLowerCase()}"
                data-category="${category.name.toLowerCase()}">
                <button onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="w-full px-4 py-2.5 flex items-center justify-between ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} transition-colors">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <span class="${isLightMode ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-white'} px-2 py-0.5 rounded text-[10px] flex-shrink-0">${method}</span>
                        <div class="text-left flex-1 min-w-0">
                            <p class="code-font font-semibold text-xs truncate">${path}</p>
                            <div class="flex items-center gap-2 mt-0.5">
                                <p class="text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'} truncate">${item.name}</p>
                                <span class="px-1.5 py-0.5 text-[10px] rounded-full ${statusClass} flex-shrink-0">${item.status || 'ready'}</span>
                            </div>
                        </div>
                    </div>
                    <svg id="ep-icon-${catIdx}-${epIdx}" class="w-4 h-4 ${isLightMode ? 'text-gray-600' : 'text-gray-400'} transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                
                <div id="ep-${catIdx}-${epIdx}" class="hidden ${isLightMode ? 'bg-gray-100' : 'bg-gray-800/30'} px-4 py-3 border-t ${isLightMode ? 'border-gray-300' : 'border-gray-700'}">
                    <p class="${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-3 text-xs">${item.desc}</p>
                    
                    <div class="mb-3">
                        <div class="flex items-center justify-between mb-1.5">
                            <h4 class="font-bold text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}">🔗 Endpoint</h4>
                            <div class="flex gap-2">
                                <button onclick="copyText('${path}', 'Path')" class="px-2 py-1 ${isLightMode ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'} rounded text-[10px] transition-colors">
                                    Copy Path
                                </button>
                                <button onclick="copyText('${BASE_URL}${path}', 'URL')" class="px-2 py-1 ${isLightMode ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'} rounded text-[10px] transition-colors">
                                    Copy Full URL
                                </button>
                            </div>
                        </div>
                        <div class="${isLightMode ? 'bg-gray-200 border-gray-300' : 'bg-gray-900/50 border-gray-700'} border px-3 py-2 rounded-lg">
                            <code class="code-font text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}">${path}</code>
                        </div>
                    </div>`;

            if (item.status === 'ready') {
                html += `
                    <div>
                        <h4 class="font-bold text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-3">⚡ Try it out</h4>
                        <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${path}')">
                            <div class="space-y-3 mb-4">`;
                
                if (item.params) {
                    Object.keys(item.params).forEach(paramName => {
                        const isRequired = !queryParams.has(paramName) || queryParams.get(paramName) === '';
                        html += `
                            <div>
                                <label class="block text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-2">
                                    ${paramName} ${isRequired ? '<span class="text-red-500">*</span>' : ''}
                                </label>
                                <input 
                                    type="text" 
                                    name="${paramName}" 
                                    class="search-input w-full px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 code-font text-sm" 
                                    placeholder="${item.params[paramName]}" 
                                    ${isRequired ? 'required' : ''}
                                >
                            </div>`;
                    });
                }
                
                html += `
                            </div>
                            <div class="flex gap-3 flex-wrap">
                                <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all">
                                    Execute
                                </button>
                                <button type="button" onclick="clearResponse(${catIdx}, ${epIdx})" class="px-6 py-2 ${isLightMode ? 'bg-gray-300 hover:bg-gray-400 border-gray-400' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'} border rounded-lg font-semibold text-sm transition-colors">
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div id="curl-section-${catIdx}-${epIdx}" class="hidden mt-4">
                        <div class="flex items-center justify-between mb-1.5">
                            <h4 class="font-bold text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}">📟 cURL Command</h4>
                            <button onclick="copyText(document.getElementById('curl-command-${catIdx}-${epIdx}').textContent, 'cURL')" class="px-2 py-1 ${isLightMode ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'} rounded text-[10px] transition-colors">
                                Copy cURL
                            </button>
                        </div>
                        <div class="${isLightMode ? 'bg-gray-200 border-gray-300' : 'bg-gray-900/50 border-gray-700'} border px-3 py-2 rounded-lg">
                            <code id="curl-command-${catIdx}-${epIdx}" class="code-font text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'} break-all">curl -X ${method} "${BASE_URL}${path}"</code>
                        </div>
                    </div>
                    
                    <div id="response-${catIdx}-${epIdx}" class="hidden mt-4">
                        <h4 class="font-bold text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-2">📄 Response</h4>
                        <div class="${isLightMode ? 'bg-gray-200 border-gray-300' : 'bg-gray-900/50 border-gray-700'} border px-4 py-3 rounded-lg max-h-96 overflow-auto" id="response-content-${catIdx}-${epIdx}"></div>
                    </div>`;
            } else {
                html += `<div class="px-4 py-3 status-warning border rounded-lg text-sm">⚠️ This endpoint is not available for testing</div>`;
            }

            html += `
                </div>
            </div>`;
        });
        
        html += `</div></div></div>`;
    });
    
    apiList.innerHTML = html;
    
    // Simpan semua elemen API untuk pencarian
    allApiElements = Array.from(document.querySelectorAll('.api-item'));
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');

    // Jika search kosong, tampilkan semua
    if (searchTerm === '') {
        document.querySelectorAll('.category-group').forEach(cat => {
            cat.classList.remove('hidden');
            cat.querySelectorAll('.api-item').forEach(item => {
                item.classList.remove('hidden');
            });
        });
        noResults.classList.add('hidden');
        return;
    }

    let hasVisibleItems = false;

    // Loop melalui semua kategori
    document.querySelectorAll('.category-group').forEach(category => {
        let categoryHasVisibleItems = false;
        
        // Loop melalui semua item API dalam kategori
        category.querySelectorAll('.api-item').forEach(item => {
            const path = item.dataset.path.toLowerCase();
            const alias = item.dataset.alias;
            const desc = item.dataset.description;
            const categoryName = item.dataset.category;

            // Cek apakah ada yang cocok dengan search term
            const matches = 
                path.includes(searchTerm) || 
                alias.includes(searchTerm) || 
                desc.includes(searchTerm) ||
                categoryName.includes(searchTerm);

            if (matches) {
                item.classList.remove('hidden');
                categoryHasVisibleItems = true;
                hasVisibleItems = true;
            } else {
                item.classList.add('hidden');
            }
        });

        // Tampilkan/sembunyikan kategori berdasarkan apakah ada item yang visible
        if (categoryHasVisibleItems) {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });

    // Tampilkan/sembunyikan pesan "no results"
    if (hasVisibleItems) {
        noResults.classList.add('hidden');
    } else {
        noResults.classList.remove('hidden');
    }
}

// Initialize theme - HARUS dipanggil di DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing theme...');
    initTheme();
    
    // Initialize REAL battery detection
    initBatteryDetection();
    
    // Load API data
    fetch('listapi.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load listapi.json');
            return res.json();
        })
        .then(data => {
            apiData = data;
            console.log('API data loaded successfully:', data.categories.length, 'categories');
            loadApis();
        })
        .catch(err => {
            console.error('Error loading API data:', err);
            const apiList = document.getElementById('apiList');
            apiList.innerHTML = `
                <div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg">
                    <div class="text-4xl mb-4">⚠️</div>
                    <h3 class="font-bold text-lg mb-2">Failed to load API data</h3>
                    <p class="text-sm">Please check if listapi.json exists on the server</p>
                    <p class="text-xs mt-4 text-gray-400">Error: ${err.message}</p>
                </div>
            `;
        });
});

// Add event listeners
themeToggleBtn.addEventListener('click', toggleTheme);

// Search functionality with debounce
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
});

// Add keyboard shortcut for search (Ctrl/Cmd + K)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// Smooth scroll untuk anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add click event to clear search when clicking outside
document.addEventListener('click', function(event) {
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.querySelector('.relative');
    
    if (!searchContainer.contains(event.target)) {
        // Kosongkan search jika klik di luar
        if (searchInput.value.trim() === '') {
            performSearch();
        }
    }
});

// Handle Escape key untuk cancel loading (optional)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isRequestInProgress) {
        // Bisa tambahkan logika untuk cancel request jika perlu
        hideLoading();
        isRequestInProgress = false;
        showToast('Request cancelled', true);
    }
});

// Pastikan scroll di-enable kembali jika page di-refresh atau di-unload
window.addEventListener('beforeunload', function() {
    if (isRequestInProgress) {
        enableScroll();
    }
    cleanupBatteryMonitor();
});

// Handle ketika loading masih aktif tapi user refresh page
window.addEventListener('load', function() {
    // Pastikan tidak ada state loading yang tersisa
    if (document.body.classList.contains('no-scroll')) {
        enableScroll();
    }
});
