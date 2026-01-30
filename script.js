const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let allApiElements = [];
let totalEndpoints = 0;
let totalCategories = 0;
let batteryMonitor = null;

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
    } else {
        body.classList.remove('light-mode');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
    }
    
    updateSocialBadges();
}

function toggleTheme() {
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
        currentTheme = 'dark';
    } else {
        body.classList.add('light-mode');
        themeToggleDarkIcon.classList.add('hidden');
        themeToggleLightIcon.classList.remove('hidden');
        currentTheme = 'light';
    }
    
    localStorage.setItem('theme', currentTheme);
    updateSocialBadges();
    if (apiData) loadApis();
}

function updateSocialBadges() {
    const isLightMode = body.classList.contains('light-mode');
    const socialBadges = document.querySelectorAll('.social-badge > div');
    
    socialBadges.forEach(badge => {
        badge.className = 'px-4 py-2 rounded-lg text-sm transition-colors';
        if (isLightMode) {
            badge.classList.add('bg-gray-100', 'text-gray-800', 'hover:bg-gray-200');
        } else {
            badge.classList.add('bg-gray-800', 'text-gray-300', 'hover:bg-gray-700');
        }
    });
}

function initBatteryDetection() {
    const batteryLevelElement = document.getElementById('batteryLevel');
    const batteryPercentageElement = document.getElementById('batteryPercentage');
    const batteryStatusElement = document.getElementById('batteryStatus');
    const batteryContainer = document.getElementById('batteryContainer');
    
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryInfo() {
                const level = battery.level * 100;
                const isCharging = battery.charging;
                const roundedLevel = Math.round(level);
                const isLightMode = body.classList.contains('light-mode');
                
                batteryPercentageElement.textContent = `${roundedLevel}%`;
                batteryLevelElement.style.width = `${level}%`;
                
                if (level > 60) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-green-600' : 'bg-green-500');
                } else if (level > 20) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-yellow-600' : 'bg-yellow-500');
                } else {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-red-600' : 'bg-red-500');
                }
                
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
                
                if (isCharging && battery.chargingTime !== Infinity) {
                    const hours = Math.floor(battery.chargingTime / 3600);
                    const minutes = Math.floor((battery.chargingTime % 3600) / 60);
                    batteryStatusElement.textContent = `Charging (${hours}h ${minutes}m)`;
                } else if (!isCharging && battery.dischargingTime !== Infinity) {
                    const hours = Math.floor(battery.dischargingTime / 3600);
                    const minutes = Math.floor((battery.dischargingTime % 3600) / 60);
                    batteryStatusElement.textContent = `${hours}h ${minutes}m left`;
                }
            }
            
            updateBatteryInfo();
            battery.addEventListener('levelchange', updateBatteryInfo);
            battery.addEventListener('chargingchange', updateBatteryInfo);
            battery.addEventListener('chargingtimechange', updateBatteryInfo);
            battery.addEventListener('dischargingtimechange', updateBatteryInfo);
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
    
    function fallbackBattery() {
        batteryStatusElement.textContent = 'Simulated';
        let simulatedLevel = localStorage.getItem('simulatedBattery');
        if (!simulatedLevel) {
            simulatedLevel = Math.floor(Math.random() * 30) + 30;
            localStorage.setItem('simulatedBattery', simulatedLevel.toString());
        } else {
            simulatedLevel = parseInt(simulatedLevel);
        }
        
        let isSimulatedCharging = localStorage.getItem('simulatedCharging') === 'true';
        
        function simulateBattery() {
            const isLightMode = body.classList.contains('light-mode');
            let newLevel = simulatedLevel;
            
            if (isSimulatedCharging) {
                const chargeRate = 0.5;
                newLevel = Math.min(100, newLevel + chargeRate);
                
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
                const drainRate = 0.1;
                newLevel = Math.max(5, newLevel - drainRate);
                
                if (newLevel <= 15 && Math.random() > 0.7) {
                    isSimulatedCharging = true;
                    localStorage.setItem('simulatedCharging', 'true');
                    batteryContainer.classList.add('charging');
                    batteryLevelElement.classList.add('battery-charging');
                    batteryStatusElement.textContent = 'Charging';
                } else {
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
            
            simulatedLevel = newLevel;
            localStorage.setItem('simulatedBattery', newLevel.toString());
            const roundedLevel = Math.round(newLevel);
            batteryPercentageElement.textContent = `${roundedLevel}%`;
            batteryLevelElement.style.width = `${newLevel}%`;
            
            if (newLevel > 60) {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-green-600' : 'bg-green-500');
            } else if (newLevel > 20) {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-yellow-600' : 'bg-yellow-500');
            } else {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-red-600' : 'bg-red-500');
            }
        }
        
        simulateBattery();
        setInterval(simulateBattery, 10000);
    }
}

function cleanupBatteryMonitor() {
    if (batteryMonitor) {
        batteryMonitor.removeEventListener('levelchange', updateBatteryInfo);
        batteryMonitor.removeEventListener('chargingchange', updateBatteryInfo);
        batteryMonitor.removeEventListener('chargingtimechange', updateBatteryInfo);
        batteryMonitor.removeEventListener('dischargingtimechange', updateBatteryInfo);
        batteryMonitor = null;
    }
}

function updateTotalEndpoints() {
    const totalEndpointsElement = document.getElementById('totalEndpoints');
    totalEndpointsElement.textContent = totalEndpoints;
}

function updateTotalCategories() {
    const totalCategoriesElement = document.getElementById('totalCategories');
    totalCategoriesElement.textContent = totalCategories;
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

function createMediaPreview(url, contentType) {
    const type = getContentType(url, contentType);
    let previewHtml = '';
    
    switch(type) {
        case 'image':
            previewHtml = `<div class="media-preview"><img src="${url}" class="media-image" alt="Response Image"></div>`;
            break;
        case 'video':
            previewHtml = `<div class="media-preview"><video controls class="media-iframe"><source src="${url}" type="${contentType || 'video/mp4'}">Your browser does not support the video tag.</video></div>`;
            break;
        case 'audio':
            previewHtml = `<div class="media-preview"><audio controls class="w-full"><source src="${url}" type="${contentType || 'audio/mpeg'}">Your browser does not support the audio tag.</audio></div>`;
            break;
        case 'pdf':
            previewHtml = `<div class="media-preview"><iframe src="${url}" class="media-iframe" frameborder="0"></iframe></div>`;
            break;
        default:
            previewHtml = `<div class="media-preview"><iframe src="${url}" class="media-iframe" frameborder="0"></iframe></div>`;
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
    const urlSection = document.getElementById(`url-section-${catIdx}-${epIdx}`);
    const curlCommand = document.getElementById(`curl-command-${catIdx}-${epIdx}`);
    const urlCommand = document.getElementById(`url-command-${catIdx}-${epIdx}`);
    const executeBtn = form.querySelector('button[type="submit"]');
    
    let spinner = executeBtn.querySelector('.local-spinner');
    if (!spinner) {
        spinner = document.createElement('span');
        spinner.className = 'local-spinner ml-2';
        executeBtn.appendChild(spinner);
    }
    
    isRequestInProgress = true;
    executeBtn.disabled = true;
    executeBtn.classList.add('btn-loading');
    spinner.classList.add('active');
    
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
    
    const urlText = fullPath;
    urlCommand.textContent = urlText;
    urlSection.classList.remove('hidden');

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
        executeBtn.disabled = false;
        executeBtn.classList.remove('btn-loading');
        spinner.classList.remove('active');
    }
}

function clearResponse(catIdx, epIdx) {
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    const curlSection = document.getElementById(`curl-section-${catIdx}-${epIdx}`);
    const urlSection = document.getElementById(`url-section-${catIdx}-${epIdx}`);
    responseDiv.classList.add('hidden');
    curlSection.classList.add('hidden');
    urlSection.classList.add('hidden');
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiData || !apiData.categories) {
        apiList.innerHTML = '<p class="text-center">No API data loaded.</p>';
        return;
    }
    
    const isLightMode = body.classList.contains('light-mode');
    
    totalEndpoints = 0;
    totalCategories = apiData.categories.length;
    
    apiData.categories.forEach(category => {
        totalEndpoints += category.items.length;
    });
    
    updateTotalEndpoints();
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
                                <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center">
                                    Execute
                                    <span class="local-spinner ml-2"></span>
                                </button>
                                <button type="button" onclick="clearResponse(${catIdx}, ${epIdx})" class="px-6 py-2 ${isLightMode ? 'bg-gray-300 hover:bg-gray-400 border-gray-400' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'} border rounded-lg font-semibold text-sm transition-colors">
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div id="url-section-${catIdx}-${epIdx}" class="hidden mt-4">
                        <div class="flex items-center justify-between mb-1.5">
                            <h4 class="font-bold text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}">🌐 URL Request</h4>
                            <button onclick="copyText(document.getElementById('url-command-${catIdx}-${epIdx}').textContent, 'URL')" class="px-2 py-1 ${isLightMode ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'} rounded text-[10px] transition-colors">
                                Copy URL
                            </button>
                        </div>
                        <div class="${isLightMode ? 'bg-gray-200 border-gray-300' : 'bg-gray-900/50 border-gray-700'} border px-3 py-2 rounded-lg">
                            <code id="url-command-${catIdx}-${epIdx}" class="code-font text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'} break-all"></code>
                        </div>
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
    allApiElements = Array.from(document.querySelectorAll('.api-item'));
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');

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

    document.querySelectorAll('.category-group').forEach(category => {
        let categoryHasVisibleItems = false;
        
        category.querySelectorAll('.api-item').forEach(item => {
            const path = item.dataset.path.toLowerCase();
            const alias = item.dataset.alias;
            const desc = item.dataset.description;
            const categoryName = item.dataset.category;

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

        if (categoryHasVisibleItems) {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });

    if (hasVisibleItems) {
        noResults.classList.add('hidden');
    } else {
        noResults.classList.remove('hidden');
    }
}

async function loadLinkBio() {
    try {
        const response = await fetch('linkbio.json');
        if (!response.ok) throw new Error('Failed to load linkbio.json');
        const socialData = await response.json();
        
        if (!socialData.link_bio || !Array.isArray(socialData.link_bio)) {
            throw new Error('Invalid linkbio.json format');
        }
        
        document.getElementById('socialLoading').classList.add('hidden');
        document.getElementById('socialError').classList.add('hidden');
        
        const socialContainer = document.getElementById('socialContainer');
        const isLightMode = body.classList.contains('light-mode');
        
        socialData.link_bio.forEach(social => {
            const socialElement = document.createElement('a');
            socialElement.href = social.url;
            socialElement.target = '_blank';
            socialElement.className = 'social-badge';
            
            const innerDiv = document.createElement('div');
            innerDiv.className = 'px-4 py-2 rounded-lg text-sm transition-colors';
            
            if (isLightMode) {
                innerDiv.classList.add('bg-gray-100', 'text-gray-800', 'hover:bg-gray-200');
            } else {
                innerDiv.classList.add('bg-gray-800', 'text-gray-300', 'hover:bg-gray-700');
            }
            
            innerDiv.textContent = social.name;
            socialElement.appendChild(innerDiv);
            socialContainer.appendChild(socialElement);
        });
        
    } catch (error) {
        console.error('Error loading link bio:', error);
        document.getElementById('socialLoading').classList.add('hidden');
        document.getElementById('socialError').classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initBatteryDetection();
    loadLinkBio();
    
    fetch('/api/apilist')
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
                    <p class="text-sm">Please check if /api/apilist exists on the server</p>
                    <p class="text-xs mt-4 text-gray-400">Error: ${err.message}</p>
                </div>
            `;
        });
});

themeToggleBtn.addEventListener('click', toggleTheme);

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

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

document.addEventListener('click', function(event) {
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.querySelector('.relative');
    
    if (!searchContainer.contains(event.target)) {
        if (searchInput.value.trim() === '') {
            performSearch();
        }
    }
});

window.addEventListener('beforeunload', function() {
    cleanupBatteryMonitor();
});
