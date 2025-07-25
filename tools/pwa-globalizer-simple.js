#!/usr/bin/env node

/**
 * PWA Globalizer - Simplified Version
 * Adds PWA support to all HTML pages
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
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/logo/apple-icon-180x180.png">`;

// Service Worker Registration Script
const PWA_SERVICE_WORKER = `
    <!-- PWA Service Worker Registration -->
    <script>
        // Google PWA Standards Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                        updateViaCache: 'none'
                    });
                    console.log('✅ Service Worker registered:', registration.scope);
                    
                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                    
                    window.dampPWA = { registration };
                } catch (error) {
                    console.error('❌ Service Worker failed:', error);
                }
            });
        }
        
        function showUpdateNotification() {
            const notification = document.createElement('div');
            notification.innerHTML = '<div style="position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#00d4ff,#00ff88);color:#1a1a2e;padding:15px 25px;border-radius:30px;font-weight:600;z-index:10000;display:flex;align-items:center;gap:15px;"><span>🚀</span><span>New version available!</span><button onclick="refreshApp()" style="background:rgba(26,26,46,0.2);color:#1a1a2e;border:none;padding:8px 16px;border-radius:20px;font-weight:600;cursor:pointer;">Update</button><button onclick="this.parentElement.parentElement.remove()" style="background:transparent;border:none;color:#1a1a2e;cursor:pointer;padding:5px;">×</button></div>';
            document.body.appendChild(notification);
        }
        
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
        
        // PWA Install Prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            setTimeout(showInstallPrompt, 3000);
        });
        
        function showInstallPrompt() {
            if (!deferredPrompt) return;
            const installBtn = document.createElement('button');
            installBtn.innerHTML = '📱 Install App';
            installBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:linear-gradient(45deg,#00d4ff,#00ff88);color:#1a1a2e;border:none;padding:15px 25px;border-radius:30px;font-weight:700;cursor:pointer;z-index:9999;animation:pulse 2s infinite;';
            installBtn.onclick = async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('✅ PWA installed');
                    if ('gtag' in window) gtag('event', 'pwa_install', { event_category: 'engagement' });
                }
                deferredPrompt = null;
                installBtn.remove();
            };
            document.body.appendChild(installBtn);
        }
        
        // PWA Styles
        const pwaStyles = document.createElement('style');
        pwaStyles.textContent = '@keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } } @media (display-mode: standalone) { body { padding-top: env(safe-area-inset-top); } }';
        document.head.appendChild(pwaStyles);
    </script>`;

async function globalizePWA() {
    console.log('🌐 Globalizing PWA implementation...');
    
    // Change to project root directory
    process.chdir(path.join(__dirname, '..'));
    
    const WEBSITE_DIR = path.join(process.cwd(), 'website');
    const patterns = [
        'website/*.html',
        'website/pages/*.html'
    ];
    
    const files = [];
    for (const pattern of patterns) {
        const matches = glob.sync(pattern);
        console.log(`Pattern ${pattern} found ${matches.length} files`);
        files.push(...matches);
    }
    
    console.log(`📄 Processing ${files.length} HTML files...`);
    
    for (const filePath of files) {
        const relativePath = path.relative(WEBSITE_DIR, filePath);
        console.log(`📱 Processing ${relativePath}...`);
        
        try {
            let content = await fs.readFile(filePath, 'utf8');
            
            // Skip if already has PWA
            if (content.includes('rel="manifest"')) {
                console.log(`ℹ️ ${relativePath} already has PWA, skipping...`);
                continue;
            }
            
            // Add PWA meta tags
            const headCloseMatch = content.match(/<\/head>/i);
            if (headCloseMatch) {
                content = content.slice(0, headCloseMatch.index) + 
                         PWA_META_TAGS + 
                         content.slice(headCloseMatch.index);
            }
            
            // Add service worker
            const bodyCloseMatch = content.match(/<\/body>/i);
            if (bodyCloseMatch) {
                content = content.slice(0, bodyCloseMatch.index) + 
                         PWA_SERVICE_WORKER + 
                         content.slice(bodyCloseMatch.index);
            }
            
            // Fix paths for subdirectories
            if (filePath.includes('/pages/')) {
                content = content.replace(/href="\/manifest\.json"/g, 'href="../manifest.json"');
                content = content.replace(/href="\/assets\//g, 'href="../assets/');
                content = content.replace(/src="\/assets\//g, 'src="../assets/');
                content = content.replace(/register\('\/sw\.js'/g, "register('../sw.js'");
            }
            
            await fs.writeFile(filePath, content, 'utf8');
            console.log(`✅ Updated ${relativePath}`);
            
        } catch (error) {
            console.error(`❌ Failed ${relativePath}:`, error.message);
        }
    }
    
    // Create browserconfig.xml
    const browserConfig = '<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square70x70logo src="/assets/images/logo/icon-72.png"/>\n      <square150x150logo src="/assets/images/logo/icon-144.png"/>\n      <TileColor>#1a1a2e</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>';
    await fs.writeFile(path.join(WEBSITE_DIR, 'browserconfig.xml'), browserConfig);
    console.log('✅ Created browserconfig.xml');
    
    console.log('🎉 PWA globalization completed!');
}

if (require.main === module) {
    globalizePWA();
}

module.exports = { globalizePWA }; 