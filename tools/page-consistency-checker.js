#!/usr/bin/env node

/**
 * DAMP Smart Drinkware Website Consistency Checker
 * Automated tool to maintain consistency across website pages
 */

const fs = require('fs');
const path = require('path');

// Load page inventory
const pageInventory = require('../website/pages/page-inventory.json');

class PageConsistencyChecker {
    constructor() {
        this.pagesDir = path.join(__dirname, '../website/pages');
        this.mainDir = path.join(__dirname, '../website');
        this.issues = [];
        this.fixes = [];
    }

    /**
     * Check all pages for consistency issues
     */
    async checkAllPages() {
        console.log('🔍 Starting page consistency check...\n');
        
        // Get all HTML files
        const htmlFiles = this.getHtmlFiles();
        
        for (const file of htmlFiles) {
            await this.checkPage(file);
        }
        
        this.generateReport();
        return this.issues;
    }

    /**
     * Get all HTML files in the pages directory
     */
    getHtmlFiles() {
        const files = [];
        
        // Check main directory
        const mainFiles = fs.readdirSync(this.mainDir)
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(this.mainDir, file));
            
        // Check pages directory
        const pageFiles = fs.readdirSync(this.pagesDir)
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(this.pagesDir, file));
            
        return [...mainFiles, ...pageFiles];
    }

    /**
     * Check individual page for consistency issues
     */
    async checkPage(filePath) {
        const fileName = path.basename(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        console.log(`Checking ${fileName}...`);
        
        const pageIssues = [];
        
        // Check hamburger navigation
        if (!this.hasHamburgerNav(content)) {
            pageIssues.push('Missing hamburger navigation');
        }
        
        // Check Google Analytics
        if (!this.hasGoogleAnalytics(content)) {
            pageIssues.push('Missing Google Analytics');
        }
        
        // Check mobile menu functionality
        if (!this.hasMobileMenuJS(content)) {
            pageIssues.push('Missing mobile menu JavaScript');
        }
        
        // Check responsive design
        if (!this.hasResponsiveDesign(content)) {
            pageIssues.push('Missing responsive design elements');
        }
        
        // Check safe area CSS
        if (!this.hasSafeAreaCSS(content)) {
            pageIssues.push('Missing safe area CSS variables');
        }
        
        // Check accessibility features
        if (!this.hasAccessibilityFeatures(content)) {
            pageIssues.push('Missing accessibility features');
        }
        
        if (pageIssues.length > 0) {
            this.issues.push({
                file: fileName,
                path: filePath,
                issues: pageIssues
            });
        }
        
        console.log(`  ✓ ${pageIssues.length} issues found`);
    }

    /**
     * Check if page has hamburger navigation
     */
    hasHamburgerNav(content) {
        return content.includes('hamburger') && 
               content.includes('mobile-menu') &&
               content.includes('toggleMobileMenu');
    }

    /**
     * Check if page has Google Analytics
     */
    hasGoogleAnalytics(content) {
        return content.includes('gtag') || 
               content.includes('google-analytics');
    }

    /**
     * Check if page has mobile menu JavaScript
     */
    hasMobileMenuJS(content) {
        return content.includes('function toggleMobileMenu') ||
               content.includes('toggleMobileMenu()');
    }

    /**
     * Check if page has responsive design
     */
    hasResponsiveDesign(content) {
        return content.includes('@media') &&
               content.includes('max-width');
    }

    /**
     * Check if page has safe area CSS
     */
    hasSafeAreaCSS(content) {
        return content.includes('safe-area-inset') ||
               content.includes('env(safe-area');
    }

    /**
     * Check if page has accessibility features
     */
    hasAccessibilityFeatures(content) {
        return content.includes('prefers-reduced-motion') ||
               content.includes('focus:');
    }

    /**
     * Generate hamburger navigation template
     */
    generateHamburgerNavTemplate() {
        return {
            css: `
        /* Hamburger Menu */
        .hamburger {
            display: none;
            flex-direction: column;
            cursor: pointer;
            padding: 5px;
            gap: 4px;
        }

        .hamburger span {
            width: 25px;
            height: 3px;
            background: white;
            transition: 0.3s;
            border-radius: 3px;
        }

        .hamburger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-6px, 6px);
        }

        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-6px, -6px);
        }

        /* Mobile Menu */
        .mobile-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 35, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 1001;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            padding: 100px 40px;
            overflow-y: auto;
        }

        .mobile-menu.active {
            transform: translateX(0);
        }

        .mobile-menu a {
            color: white;
            text-decoration: none;
            font-size: 2rem;
            margin-bottom: 30px;
            transition: color 0.3s ease;
        }

        .mobile-menu a:hover {
            color: #00d4ff;
        }

        .mobile-close {
            position: absolute;
            top: 30px;
            right: 30px;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }

        @media (max-width: 768px) {
            .hamburger {
                display: flex;
            }
            
            .nav-links {
                display: none;
            }
        }`,
            html: `
        <div class="hamburger" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
        </div>
        
        <div class="mobile-menu" id="mobile-menu">
            <button class="mobile-close" onclick="toggleMobileMenu()">×</button>
            <a href="/#features">Features</a>
            <a href="/#products">Products</a>
            <a href="/#app">App</a>
            <a href="/pages/support.html">Support</a>
            <a href="/pages/about.html">About</a>
            <a href="/pages/cart.html">Cart</a>
        </div>`,
            js: `
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            const hamburger = document.querySelector('.hamburger');
            
            menu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const menu = document.getElementById('mobile-menu');
            const hamburger = document.querySelector('.hamburger');
            
            if (menu.classList.contains('active') && 
                !menu.contains(event.target) && 
                !hamburger.contains(event.target)) {
                toggleMobileMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const menu = document.getElementById('mobile-menu');
                if (menu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });`
        };
    }

    /**
     * Auto-fix a page by adding missing components
     */
    async autoFixPage(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        
        const template = this.generateHamburgerNavTemplate();
        
        // Add hamburger navigation if missing
        if (!this.hasHamburgerNav(content)) {
            // Add to nav-container (after nav-links)
            updatedContent = updatedContent.replace(
                /<\/ul>\s*<\/nav>/,
                `</ul>
                ${template.html}
                </nav>`
            );
            
            // Add CSS
            updatedContent = updatedContent.replace(
                /<\/style>/,
                `${template.css}
                </style>`
            );
            
            // Add JavaScript
            updatedContent = updatedContent.replace(
                /<\/body>/,
                `<script>
                ${template.js}
                </script>
                </body>`
            );
        }
        
        // Write updated content
        fs.writeFileSync(filePath, updatedContent);
        
        console.log(`✅ Auto-fixed ${path.basename(filePath)}`);
    }

    /**
     * Generate detailed report
     */
    generateReport() {
        console.log('\n📊 CONSISTENCY CHECK REPORT');
        console.log('=' .repeat(50));
        
        if (this.issues.length === 0) {
            console.log('✅ All pages are consistent!');
            return;
        }
        
        console.log(`Found ${this.issues.length} pages with issues:\n`);
        
        this.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.file}`);
            console.log(`   Path: ${issue.path}`);
            console.log(`   Issues:`);
            issue.issues.forEach(i => console.log(`     - ${i}`));
            console.log('');
        });
        
        console.log('🔧 RECOMMENDED ACTIONS:');
        console.log('1. Run auto-fix for pages with missing hamburger navigation');
        console.log('2. Manually review and test all fixes');
        console.log('3. Update page-inventory.json status after fixes');
        console.log('4. Run this checker regularly to maintain consistency');
    }

    /**
     * Update page inventory after fixes
     */
    updateInventory(fileName, status = 'updated') {
        const inventory = pageInventory;
        
        // Update the appropriate page entry
        for (const pageKey in inventory.pages) {
            if (pageKey.includes(fileName) || fileName.includes(pageKey)) {
                inventory.pages[pageKey].status = status;
                inventory.pages[pageKey].last_updated = new Date().toISOString().split('T')[0];
                
                // Update components
                if (inventory.pages[pageKey].components) {
                    inventory.pages[pageKey].components.navigation = {
                        desktop: '✓ implemented',
                        mobile: '✓ implemented'
                    };
                    
                    // Remove issues
                    delete inventory.pages[pageKey].issues;
                }
            }
        }
        
        // Write updated inventory
        fs.writeFileSync(
            path.join(__dirname, '../website/pages/page-inventory.json'),
            JSON.stringify(inventory, null, 2)
        );
    }
}

// CLI interface
async function main() {
    const checker = new PageConsistencyChecker();
    const args = process.argv.slice(2);
    
    if (args.includes('--check')) {
        await checker.checkAllPages();
    } else if (args.includes('--fix')) {
        const issues = await checker.checkAllPages();
        
        if (issues.length > 0) {
            console.log('\n🔧 Starting auto-fix process...');
            
            for (const issue of issues) {
                if (issue.issues.includes('Missing hamburger navigation')) {
                    await checker.autoFixPage(issue.path);
                    checker.updateInventory(issue.file);
                }
            }
            
            console.log('\n✅ Auto-fix complete! Please test all pages.');
        }
    } else {
        console.log(`
DAMP Website Consistency Checker

Usage:
  node tools/page-consistency-checker.js --check    Check all pages for issues
  node tools/page-consistency-checker.js --fix      Check and auto-fix issues

Examples:
  npm run check-pages     # Check only
  npm run fix-pages       # Check and fix
        `);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = PageConsistencyChecker; 