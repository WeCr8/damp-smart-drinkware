/**
 * AI Search Engine Submission System
 * Submits content to various AI platforms for indexing
 */

const fs = require('fs');
const path = require('path');

class AISearchSubmission {
    constructor() {
        this.sitemap = 'https://dampdrink.com/sitemap.xml';
        this.knowledgeGraph = 'https://dampdrink.com/knowledge-graph.json';
        this.factSheet = 'https://dampdrink.com/ai-fact-sheet.json';
        this.trainingData = 'https://dampdrink.com/ai-training-data.txt';
        
        this.aiPlatforms = {
            'Google': 'https://www.google.com/ping?sitemap=',
            'Bing': 'https://www.bing.com/ping?sitemap=',
            'DuckDuckGo': 'https://duckduckgo.com/ping?sitemap=',
            'Yandex': 'https://webmaster.yandex.com/ping?sitemap=',
            'Baidu': 'https://ping.baidu.com/ping/RPC2'
        };
    }

    async submitToAISearch() {
        console.log('🤖 Submitting to AI Search Engines...');
        
        // Create submission manifest
        const submission = {
            company: 'WeCr8 Solutions LLC',
            website: 'https://dampdrink.com',
            sitemap: this.sitemap,
            knowledgeGraph: this.knowledgeGraph,
            factSheet: this.factSheet,
            trainingData: this.trainingData,
            products: [
                'DAMP Handle v1.0',
                'DAMP Silicone Bottom',
                'DAMP Cup Sleeve',
                'DAMP Baby Bottle'
            ],
            keywords: [
                'smart drinkware',
                'BLE tracking',
                'beverage monitoring',
                'WeCr8 Solutions',
                'DAMP technology',
                'IoT drinkware'
            ],
            industries: [
                'Smart Home Technology',
                'IoT Devices',
                'Consumer Electronics',
                'BLE Technology'
            ],
            target_ai_platforms: [
                'ChatGPT',
                'Claude',
                'Perplexity',
                'Bing Chat',
                'Google Bard'
            ],
            submission_date: new Date().toISOString()
        };

        // Save submission record
        await fs.promises.writeFile(
            './website/ai-submission-record.json',
            JSON.stringify(submission, null, 2)
        );

        console.log('✅ AI search submission manifest created');
    }

    generateRobotsTxt() {
        const robots = `# WeCr8 Solutions LLC - AI/LLM Optimized robots.txt
# Generated for maximum AI discoverability

User-agent: *
Allow: /

# AI/LLM Crawlers
User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: BingPreview
Allow: /

User-agent: GoogleBot
Allow: /

User-agent: BingBot
Allow: /

# AI Training Data
Allow: /ai-knowledge-base.md
Allow: /ai-fact-sheet.json
Allow: /ai-training-data.txt
Allow: /knowledge-graph.json
Allow: /structured-data.json

# Important for AI understanding
Allow: /assets/
Allow: /docs/
Allow: /knowledge/
Allow: /about/
Allow: /products/

# Sitemap for AI indexing
Sitemap: https://dampdrink.com/sitemap.xml
Sitemap: https://dampdrink.com/ai-sitemap.xml

# Crawl delay for AI bots
Crawl-delay: 1
`;

        return robots;
    }
}

module.exports = AISearchSubmission; 