#!/usr/bin/env node

/**
 * PWA Globalizer - Google Engineering Standards
 * Adds comprehensive PWA support to all HTML pages
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

// PWA Meta Tags Template
const PWA_META_TAGS = `
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="DAMP">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="msapplication-TileColor" content="#1a1a2e">
    <meta name="msapplication-tap-highlight" content="no">
    
    <!-- PWA Theme Colors -->
    <meta name="theme-color" content="#00d4ff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)">
    
    <!-- PWA Icons -->
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/logo/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/logo/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="48x48" href="/assets/images/logo/icon-48.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/logo/icon-192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/assets/images/logo/icon-512.png">
    
    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" sizes="57x57" href="/assets/images/logo/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/assets/images/logo/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/assets/images/logo/icon-72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/assets/images/logo/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/assets/images/logo/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/assets/images/logo/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/assets/images/logo/icon-144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/logo/icon-152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/logo/apple-icon-180x180.png">
    
    <!-- iOS Splash Screens -->
    <link rel="apple-touch-startup-image" href="/assets/images/logo/splash/splash-iphone-8.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)">
    <link rel="apple-touch-startup-image" href="/assets/images/logo/splash/splash-iphone-8-plus.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)">
    <link rel="apple-touch-startup-image" href="/assets/images/logo/splash/splash-iphone-x.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">
    <link rel="apple-touch-startup-image" href="/assets/images/logo/splash/splash-iphone-xr.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)">
    <link rel="apple-touch-startup-image" href="/assets/images/logo/splash/splash-iphone-xs-max.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)">
    <link rel="apple-touch-startup-image" href="/assets/images/logo/splash/splash-ipad.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)">
    <link rel="apple-touch-startup-image" href="/assets/images/logo/splash/splash-ipad-pro.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)">
    
    <!-- Microsoft Tiles -->
    <meta name="msapplication-TileImage" content="/assets/images/logo/icon-144.png">
    <meta name="msapplication-config" content="/browserconfig.xml">`;

// Service Worker Registration Script
const PWA_SERVICE_WORKER = `
    <!-- PWA Service Worker Registration -->
    <script>
        // Service Worker Registration - Google PWA Standards
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            window.addEventListener('load', async () => {
                try {
                    console.log('🔄 Registering Service Worker...');
                    
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                        updateViaCache: 'none'
                    });
                    
                    console.log('✅ Service Worker registered:', registration.scope);
                    
                    // Handle service worker updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('🔄 New Service Worker installing...');
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('✨ New content available, showing update notification');
                                showUpdateNotification();
                            }
                        });
                    });
                    
                    // Check for waiting service worker
                    if (registration.waiting) {
                        showUpdateNotification();
                    }
                    
                    // Handle periodic sync (if supported)
                    if ('periodicSync' in registration) {
                        try {
                            await registration.periodicSync.register('background-sync', {
                                minInterval: 12 * 60 * 60 * 1000 // 12 hours
                            });
                            console.log('✅ Periodic Background Sync registered');
                        } catch (error) {
                            console.log('ℹ️ Periodic Background Sync not available');
                        }
                    }
                    
                    // Store registration globally
                    window.dampPWA = { registration, isInstalled: checkIfInstalled() };
                    
                } catch (error) {
                    console.error('❌ Service Worker registration failed:', error);
                }
            });
        }
        
        // Check if running as installed PWA
        function checkIfInstalled() {
            return window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone === true ||
                   document.referrer.includes('android-app://');
        }
        
        // Show update notification
        function showUpdateNotification() {
            // Skip if notification already shown
            if (document.querySelector('.pwa-update-notification')) return;
            
            const notification = document.createElement('div');
            notification.className = 'pwa-update-notification';
            notification.innerHTML = \`
                <div style="
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #00d4ff, #00ff88);
                    color: #1a1a2e;
                    padding: 15px 25px;
                    border-radius: 30px;
                    font-weight: 600;
                    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    animation: slideDown 0.3s ease;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <span>🚀</span>
                    <span>New version available!</span>
                    <button onclick="refreshApp()" style="
                        background: rgba(26, 26, 46, 0.2);
                        color: #1a1a2e;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='rgba(26, 26, 46, 0.3)'" 
                       onmouseout="this.style.background='rgba(26, 26, 46, 0.2)'">
                        Update
                    </button>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: transparent;
                        border: none;
                        color: #1a1a2e;
                        font-size: 18px;
                        cursor: pointer;
                        padding: 5px;
                        opacity: 0.7;
                    " onmouseover="this.style.opacity='1'" 
                       onmouseout="this.style.opacity='0.7'">
                        ×
                    </button>
                </div>
            \`;
            
            // Add animation styles
            if (!document.querySelector('#pwa-update-styles')) {
                const styles = document.createElement('style');
                styles.id = 'pwa-update-styles';
                styles.textContent = \`
                    @keyframes slideDown {
                        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                        to { transform: translateX(-50%) translateY(0); opacity: 1; }
                    }
                \`;
                document.head.appendChild(styles);
            }
            
            document.body.appendChild(notification);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideDown 0.3s ease reverse';
                    setTimeout(() => notification.remove(), 300);
                }
            }, 10000);
        }
        
        // Refresh app with new service worker
        function refreshApp() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration && registration.waiting) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                });
            }
        }
        
        // PWA Install Prompt Handler
        let deferredPrompt = null;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button after page loads
            if (document.readyState === 'complete') {
                showInstallPrompt();
            } else {
                window.addEventListener('load', showInstallPrompt);
            }
        });
        
        function showInstallPrompt() {
            if (!deferredPrompt || checkIfInstalled()) return;
            
            // Create install button (only if not already present)
            if (document.querySelector('.pwa-install-btn')) return;
            
            const installBtn = document.createElement('button');
            installBtn.className = 'pwa-install-btn';
            installBtn.innerHTML = '📱 Install App';
            installBtn.style.cssText = \`
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(45deg, #00d4ff, #00ff88);
                color: #1a1a2e;
                border: none;
                padding: 15px 25px;
                border-radius: 30px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
                z-index: 9999;
                transition: all 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: pulse 2s infinite;
            \`;
            
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        console.log('✅ PWA installed by user');
                        
                        // Track installation
                        if ('gtag' in window) {
                            gtag('event', 'pwa_install', {
                                event_category: 'engagement',
                                event_label: 'user_initiated'
                            });
                        }
                    }
                    
                    deferredPrompt = null;
                    installBtn.remove();
                }
            });
            
            document.body.appendChild(installBtn);
            
            // Auto-hide after 30 seconds
            setTimeout(() => {
                if (installBtn.parentNode) {
                    installBtn.style.opacity = '0';
                    installBtn.style.transform = 'translateY(20px)';
                    setTimeout(() => installBtn.remove(), 300);
                }
            }, 30000);
        }
        
        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            
            // Track installation
            if ('gtag' in window) {
                gtag('event', 'pwa_installed', {
                    event_category: 'engagement',
                    event_label: 'automatic'
                });
            }
            
            // Remove install button if present
            const installBtn = document.querySelector('.pwa-install-btn');
            if (installBtn) installBtn.remove();
            
            deferredPrompt = null;
        });
        
        // Add PWA-specific styles
        if (!document.querySelector('#pwa-global-styles')) {
            const pwaStyles = document.createElement('style');
            pwaStyles.id = 'pwa-global-styles';
            pwaStyles.textContent = \`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                
                @media (display-mode: standalone) {
                    body { padding-top: env(safe-area-inset-top); }
                    .pwa-install-btn { display: none !important; }
                }
                
                @media (display-mode: minimal-ui) {
                    body { padding-top: env(safe-area-inset-top); }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .pwa-install-btn { animation: none !important; }
                    .pwa-update-notification { animation: none !important; }
                }
            \`;
            document.head.appendChild(pwaStyles);
        }
    </script>`;

// Path configurations
const WEBSITE_DIR = path.join(__dirname, '../website');
const PAGES_DIR = path.join(WEBSITE_DIR, 'pages');

/**
 * Main function to globalize PWA implementation
 */
async function globalizePWA() {
    console.log('🌐 Globalizing PWA implementation...');
    
    try {
        // Find all HTML files
        const htmlFiles = await findAllHTMLFiles();
        console.log(`📄 Found ${htmlFiles.length} HTML files to process`);
        
        // Process each HTML file
        for (const filePath of htmlFiles) {
            await processPWAForFile(filePath);
        }
        
        // Create browser config file
        await createBrowserConfig();
        
        // Create offline page
        await createOfflinePage();
        
        console.log('🎉 PWA globalization completed successfully!');
        
    } catch (error) {
        console.error('❌ PWA globalization failed:', error);
        process.exit(1);
    }
}

/**
 * Find all HTML files in the project
 */
async function findAllHTMLFiles() {
    const patterns = [
        path.join(WEBSITE_DIR, '*.html'),
        path.join(PAGES_DIR, '*.html')
    ];
    
    const files = [];
    
    for (const pattern of patterns) {
        const matches = glob.sync(pattern);
        files.push(...matches);
    }
    
    return files;
}

/**
 * Process PWA implementation for a single HTML file
 */
async function processPWAForFile(filePath) {
    const relativePath = path.relative(WEBSITE_DIR, filePath);
    console.log(`📱 Processing ${relativePath}...`);
    
    try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Skip if already has PWA manifest link
        if (content.includes('rel="manifest"')) {
            console.log(`ℹ️ ${relativePath} already has PWA support, skipping...`);
            return;
        }
        
        // Add PWA meta tags after existing meta tags
        const headCloseMatch = content.match(/<\/head>/i);
        if (headCloseMatch) {
            const insertPosition = headCloseMatch.index;
            content = content.slice(0, insertPosition) + 
                     PWA_META_TAGS + 
                     content.slice(insertPosition);
        }
        
        // Add service worker script before closing body tag
        const bodyCloseMatch = content.match(/<\/body>/i);
        if (bodyCloseMatch) {
            const insertPosition = bodyCloseMatch.index;
            content = content.slice(0, insertPosition) + 
                     PWA_SERVICE_WORKER + 
                     content.slice(insertPosition);
        }
        
        // Fix relative paths for files in subdirectories
        if (filePath.includes('/pages/')) {
            content = content.replace(/href="\/manifest\.json"/g, 'href="../manifest.json"');
            content = content.replace(/href="\/assets\//g, 'href="../assets/');
            content = content.replace(/src="\/assets\//g, 'src="../assets/');
            content = content.replace(/register\('\/sw\.js'/g, "register('../sw.js'");
        }
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Updated ${relativePath} with PWA support`);
        
    } catch (error) {
        console.error(`❌ Failed to process ${relativePath}:`, error.message);
    }
}

/**
 * Create browserconfig.xml for Microsoft tiles
 */
async function createBrowserConfig() {
    console.log('🔧 Creating browserconfig.xml...');
    
    const browserConfig = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<browserconfig>\n' +
        '    <msapplication>\n' +
        '        <tile>\n' +
        '            <square70x70logo src="/assets/images/logo/icon-72.png"/>\n' +
        '            <square150x150logo src="/assets/images/logo/icon-144.png"/>\n' +
        '            <square310x310logo src="/assets/images/logo/icon-384.png"/>\n' +
        '            <TileColor>#1a1a2e</TileColor>\n' +
        '        </tile>\n' +
        '    </msapplication>\n' +
        '</browserconfig>';
    
    await fs.writeFile(path.join(WEBSITE_DIR, 'browserconfig.xml'), browserConfig);
    console.log('✅ Created browserconfig.xml');
}

/**
 * Create enhanced offline page
 */
async function createOfflinePage() {
    console.log('📱 Creating enhanced offline page...');
    
    const offlinePage = '<!DOCTYPE html>' +
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DAMP - You're Offline</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
        }
        
        .offline-container {
            max-width: 500px;
            animation: fadeInUp 0.6s ease;
        }
        
        .offline-icon {
            font-size: 4rem;
            margin-bottom: 2rem;
            animation: float 3s ease-in-out infinite;
        }
        
        .offline-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
            background: linear-gradient(45deg, #00d4ff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .offline-message {
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .offline-features {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(10px);
        }
        
        .offline-features h3 {
            color: #00d4ff;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        
        .offline-features ul {
            list-style: none;
            text-align: left;
        }
        
        .offline-features li {
            padding: 0.5rem 0;
            opacity: 0.8;
        }
        
        .offline-features li::before {
            content: '✓';
            color: #00ff88;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .offline-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .offline-button {
            background: linear-gradient(135deg, #00d4ff, #00ff88);
            color: #1a1a2e;
            padding: 1rem 2rem;
            border: none;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .offline-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }
        
        .offline-button.secondary {
            background: transparent;
            color: #00d4ff;
            border: 2px solid #00d4ff;
        }
        
        .offline-button.secondary:hover {
            background: #00d4ff;
            color: #1a1a2e;
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @media (max-width: 480px) {
            .offline-title { font-size: 2rem; }
            .offline-message { font-size: 1rem; }
            .offline-actions { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
            No internet connection detected. Don't worry - you can still explore 
            previously visited pages and access cached content.
        </p>
        
        <div class="offline-features">
            <h3>Available Offline:</h3>
            <ul>
                <li>Previously visited product pages</li>
                <li>Cached product images and information</li>
                <li>Basic navigation and browsing</li>
                <li>Contact information and support</li>
            </ul>
        </div>
        
        <div class="offline-actions">
            <button class="offline-button" onclick="window.location.reload()">
                🔄 Try Again
            </button>
            <a href="/" class="offline-button secondary">
                🏠 Go Home
            </a>
        </div>
    </div>
    
    <script>
        // Check connection status
        function checkConnection() {
            if (navigator.onLine) {
                window.location.reload();
            }
        }
        
        // Listen for connection changes
        window.addEventListener('online', checkConnection);
        
        // Auto-retry every 30 seconds
        setInterval(checkConnection, 30000);
        
        // PWA-specific handling
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                console.log('PWA offline page loaded with Service Worker support');
            });
        }
    </script>
</body>
</html>';
    
    await fs.writeFile(path.join(WEBSITE_DIR, 'offline.html'), offlinePage);
    console.log('✅ Created enhanced offline.html');
}

// Run if called directly
if (require.main === module) {
    globalizePWA();
}

module.exports = { globalizePWA }; 