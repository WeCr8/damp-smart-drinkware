// DAMP Pre-Sale Tracker API
// Lightweight real-time tracking for pre-sale funnel
// Copyright 2025 WeCr8 Solutions LLC

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://dampdrink.com', 'https://www.dampdrink.com']
        : ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// Data storage (in production, use proper database)
let presaleData = {
    currentCount: 326,
    goalCount: 500,
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    recentOrders: [],
    analytics: {
        pageViews: 0,
        checkoutAttempts: 0,
        conversionRate: 0
    }
};

// Load data from file (persistent storage)
const DATA_FILE = path.join(__dirname, 'presale-data.json');

async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        presaleData = { ...presaleData, ...JSON.parse(data) };
        console.log('✅ Pre-sale data loaded successfully');
    } catch (error) {
        console.log('📝 Creating new pre-sale data file');
        await saveData();
    }
}

async function saveData() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(presaleData, null, 2));
    } catch (error) {
        console.error('❌ Error saving pre-sale data:', error);
    }
}

// Simulate realistic order activity
function simulateRealisticGrowth() {
    setInterval(() => {
        // Simulate orders during business hours (more realistic)
        const hour = new Date().getHours();
        const isBusinessHours = hour >= 9 && hour <= 21;
        const baseChance = isBusinessHours ? 0.4 : 0.1;
        
        if (Math.random() < baseChance && presaleData.currentCount < presaleData.goalCount) {
            const ordersToAdd = Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 3) + 1;
            presaleData.currentCount += ordersToAdd;
            
            // Add to recent orders
            const cities = ['Austin, TX', 'Seattle, WA', 'Denver, CO', 'Portland, OR', 'San Francisco, CA', 'New York, NY', 'Miami, FL', 'Chicago, IL'];
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            
            presaleData.recentOrders.unshift({
                timestamp: new Date().toISOString(),
                location: randomCity,
                count: ordersToAdd
            });
            
            // Keep only last 10 orders
            presaleData.recentOrders = presaleData.recentOrders.slice(0, 10);
            
            // Update conversion rate
            presaleData.analytics.conversionRate = 
                (presaleData.currentCount / presaleData.analytics.pageViews * 100).toFixed(2);
            
            saveData();
            console.log(`📈 Simulated ${ordersToAdd} order(s) from ${randomCity}. Total: ${presaleData.currentCount}`);
        }
    }, 45000); // Every 45 seconds
}

// API Routes

// Get current pre-sale status
app.get('/api/presale-status', (req, res) => {
    try {
        const now = new Date();
        const endDate = new Date(presaleData.endDate);
        const timeRemaining = Math.max(0, endDate.getTime() - now.getTime());
        
        const response = {
            currentCount: presaleData.currentCount,
            goalCount: presaleData.goalCount,
            progressPercentage: ((presaleData.currentCount / presaleData.goalCount) * 100).toFixed(1),
            timeRemaining: {
                total: timeRemaining,
                days: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
                hours: Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000)
            },
            isActive: timeRemaining > 0 && presaleData.currentCount < presaleData.goalCount,
            recentActivity: generateRecentActivityMessage(),
            urgencyLevel: calculateUrgencyLevel(),
            socialProof: {
                recentOrders: presaleData.recentOrders.slice(0, 3),
                conversionRate: presaleData.analytics.conversionRate,
                totalPageViews: presaleData.analytics.pageViews
            }
        };
        
        // Track page view
        presaleData.analytics.pageViews++;
        
        res.json(response);
    } catch (error) {
        console.error('Error getting presale status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track analytics events
app.post('/api/track-event', (req, res) => {
    try {
        const { event, data } = req.body;
        
        if (!event) {
            return res.status(400).json({ error: 'Event type required' });
        }
        
        // Track specific events
        switch (event) {
            case 'checkout_initiated':
                presaleData.analytics.checkoutAttempts++;
                break;
            case 'page_view':
                presaleData.analytics.pageViews++;
                break;
            case 'conversion_completed':
                presaleData.currentCount++;
                presaleData.recentOrders.unshift({
                    timestamp: new Date().toISOString(),
                    location: data.location || 'Unknown',
                    count: 1,
                    real: true // Mark as real order
                });
                break;
        }
        
        // Update conversion rate
        presaleData.analytics.conversionRate = 
            (presaleData.analytics.checkoutAttempts / presaleData.analytics.pageViews * 100).toFixed(2);
        
        saveData();
        
        res.json({ 
            success: true, 
            message: 'Event tracked successfully',
            currentCount: presaleData.currentCount 
        });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin endpoint to update counts (protected)
app.post('/api/admin/update-count', (req, res) => {
    try {
        const { adminKey, newCount } = req.body;
        
        // Simple admin authentication (use proper auth in production)
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        if (typeof newCount !== 'number' || newCount < 0 || newCount > presaleData.goalCount) {
            return res.status(400).json({ error: 'Invalid count value' });
        }
        
        presaleData.currentCount = newCount;
        saveData();
        
        res.json({ 
            success: true, 
            message: 'Count updated successfully',
            newCount: presaleData.currentCount 
        });
    } catch (error) {
        console.error('Error updating count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get analytics dashboard data (admin only)
app.get('/api/admin/analytics', (req, res) => {
    try {
        const { adminKey } = req.query;
        
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        res.json({
            presaleData,
            serverStats: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            }
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Helper functions
function generateRecentActivityMessage() {
    if (presaleData.recentOrders.length === 0) {
        return "Join the growing community of early adopters!";
    }
    
    const lastOrder = presaleData.recentOrders[0];
    const minutesAgo = Math.floor((new Date() - new Date(lastOrder.timestamp)) / 60000);
    
    if (minutesAgo < 60) {
        return `Last order: ${minutesAgo} minutes ago from ${lastOrder.location}`;
    } else {
        const hoursAgo = Math.floor(minutesAgo / 60);
        return `Last order: ${hoursAgo} hours ago from ${lastOrder.location}`;
    }
}

function calculateUrgencyLevel() {
    const progressPercentage = (presaleData.currentCount / presaleData.goalCount) * 100;
    const now = new Date();
    const endDate = new Date(presaleData.endDate);
    const hoursRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (progressPercentage >= 95 || hoursRemaining < 24) {
        return 'critical';
    } else if (progressPercentage >= 80 || hoursRemaining < 72) {
        return 'high';
    } else if (progressPercentage >= 60) {
        return 'medium';
    } else {
        return 'low';
    }
}

// Error handling
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize server
async function startServer() {
    try {
        await loadData();
        simulateRealisticGrowth();
        
        app.listen(PORT, () => {
            console.log(`🚀 DAMP Pre-Sale Tracker API running on port ${PORT}`);
            console.log(`📊 Current pre-orders: ${presaleData.currentCount}/${presaleData.goalCount}`);
            console.log(`⏰ Campaign ends: ${new Date(presaleData.endDate).toLocaleString()}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Graceful shutdown initiated...');
    await saveData();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Graceful shutdown initiated...');
    await saveData();
    process.exit(0);
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app; 