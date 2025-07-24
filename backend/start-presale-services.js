#!/usr/bin/env node

// DAMP Pre-Sale Services Launcher
// Starts both the pre-sale tracker and Stripe checkout APIs
// Copyright 2025 WeCr8 Solutions LLC

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

console.log('🚀 Starting DAMP Pre-Sale Services...\n');

// Service configurations
const services = [
    {
        name: 'Pre-Sale Tracker',
        script: 'api/presale-tracker.js',
        port: process.env.PORT || 3001,
        emoji: '📊'
    },
    {
        name: 'Stripe Checkout',
        script: 'api/stripe-checkout.js',
        port: process.env.CHECKOUT_PORT || 3002,
        emoji: '💳'
    }
];

const processes = [];

// Check if required files exist
function checkRequiredFiles() {
    const requiredFiles = [
        'api/presale-tracker.js',
        'api/stripe-checkout.js'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Required file not found: ${file}`);
            process.exit(1);
        }
    }
    
    console.log('✅ All required files found');
}

// Check environment configuration
function checkEnvironment() {
    const requiredEnvVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
        console.warn('⚠️  Some features may not work properly');
        console.warn('⚠️  Copy config-template.env to .env and configure your values\n');
    } else {
        console.log('✅ Environment configuration looks good');
    }
}

// Start a service
function startService(service) {
    return new Promise((resolve, reject) => {
        console.log(`${service.emoji} Starting ${service.name} on port ${service.port}...`);
        
        const child = spawn('node', [service.script], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env }
        });
        
        child.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`${service.emoji} [${service.name}] ${output}`);
        });
        
        child.stderr.on('data', (data) => {
            const error = data.toString().trim();
            console.error(`${service.emoji} [${service.name}] ERROR: ${error}`);
        });
        
        child.on('close', (code) => {
            console.log(`${service.emoji} ${service.name} exited with code ${code}`);
            
            if (code !== 0) {
                reject(new Error(`${service.name} failed to start`));
            }
        });
        
        child.on('error', (error) => {
            console.error(`${service.emoji} Failed to start ${service.name}:`, error);
            reject(error);
        });
        
        // Store process reference
        processes.push({
            name: service.name,
            process: child,
            emoji: service.emoji
        });
        
        // Give the service time to start
        setTimeout(() => {
            resolve(child);
        }, 2000);
    });
}

// Check service health
async function checkServiceHealth(port, serviceName) {
    try {
        const response = await fetch(`http://localhost:${port}/api/health`);
        if (response.ok) {
            console.log(`✅ ${serviceName} health check passed`);
            return true;
        } else {
            console.warn(`⚠️  ${serviceName} health check failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.warn(`⚠️  ${serviceName} health check failed:`, error.message);
        return false;
    }
}

// Main startup sequence
async function startServices() {
    try {
        // Pre-flight checks
        checkRequiredFiles();
        checkEnvironment();
        
        console.log('\n🔄 Starting services...\n');
        
        // Start all services
        for (const service of services) {
            await startService(service);
        }
        
        console.log('\n⏳ Waiting for services to initialize...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Health checks
        console.log('🔍 Performing health checks...\n');
        
        const healthChecks = await Promise.all([
            checkServiceHealth(3001, 'Pre-Sale Tracker'),
            checkServiceHealth(3002, 'Stripe Checkout')
        ]);
        
        const healthyServices = healthChecks.filter(Boolean).length;
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DAMP Pre-Sale Services Status');
        console.log('='.repeat(60));
        console.log(`📊 Pre-Sale Tracker API: http://localhost:3001`);
        console.log(`💳 Stripe Checkout API: http://localhost:3002`);
        console.log(`🌐 Frontend Server: http://localhost:8000`);
        console.log('='.repeat(60));
        console.log(`✅ ${healthyServices}/${services.length} services healthy`);
        
        if (healthyServices === services.length) {
            console.log('🚀 All services are running successfully!');
            console.log('\n💡 Tips:');
            console.log('   • Visit http://localhost:8000/pages/pre-sale-funnel.html to test');
            console.log('   • Use Ctrl+C to stop all services');
            console.log('   • Check logs above for any warnings');
        } else {
            console.log('⚠️  Some services may not be fully operational');
        }
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('❌ Failed to start services:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
function setupGracefulShutdown() {
    const shutdown = (signal) => {
        console.log(`\n🛑 Received ${signal}, shutting down services gracefully...`);
        
        processes.forEach(({ name, process, emoji }) => {
            console.log(`${emoji} Stopping ${name}...`);
            process.kill('SIGTERM');
        });
        
        // Force exit after 5 seconds
        setTimeout(() => {
            console.log('🔥 Force stopping remaining processes...');
            processes.forEach(({ process }) => {
                process.kill('SIGKILL');
            });
            process.exit(0);
        }, 5000);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Display banner
function displayBanner() {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                    DAMP Pre-Sale Services                ║
║                                                          ║
║  📊 Real-time pre-sale tracking                         ║
║  💳 Secure Stripe checkout integration                  ║
║  🔄 Live counter updates                                ║
║  📈 Analytics & conversion tracking                     ║
║                                                          ║
║  Copyright 2025 WeCr8 Solutions LLC                     ║
╚══════════════════════════════════════════════════════════╝
`);
}

// Start everything
async function main() {
    displayBanner();
    setupGracefulShutdown();
    await startServices();
}

// Handle unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    process.exit(1);
});

// Start the services
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { startServices, checkServiceHealth }; 