/**
 * DAMP Real-time Stats Manager
 * Manages live statistics and voting data from Firebase
 */
class DAMPRealtimeStats {
    constructor() {
        this.statsUnsubscribe = null;
        this.votingUnsubscribe = null;
        this.currentUser = null;
        this.isInitialized = false;
        
        // Default fallback data
        this.defaultStats = {
            preOrders: 5000,
            rating: 4.9,
            countries: 50,
            totalVotes: 2847,
            salesData: {
                handle: 1250,
                siliconeBottom: 1800,
                cupSleeve: 950,
                babyBottle: 1000
            }
        };
        
        this.defaultVoting = {
            products: {
                handle: { name: 'Handle', votes: 1245, percentage: 43.7 },
                siliconeBottom: { name: 'Silicone Bottom', votes: 823, percentage: 28.9 },
                cupSleeve: { name: 'Cup Sleeve', votes: 512, percentage: 18.0 },
                babyBottle: { name: 'Baby Bottle', votes: 267, percentage: 9.4 }
            },
            totalVotes: 2847,
            isActive: true
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for Firebase services to be available
            if (typeof window.firebaseServices === 'undefined') {
                await this.waitForFirebaseServices();
            }
            
            // Initialize Firebase services
            if (window.firebaseServices?.initializeFirebaseServices) {
                await window.firebaseServices.initializeFirebaseServices();
            }
            
            // Set up authentication listener
            this.setupAuthListener();
            
            // Start listening to real-time data
            this.startStatsListener();
            this.startVotingListener();
            
            this.isInitialized = true;
            console.log('DAMP Real-time Stats initialized successfully');
            
        } catch (error) {
            console.error('DAMP Real-time Stats initialization error:', error);
            // Use fallback data if Firebase is not available
            this.updateStatsDisplay(this.defaultStats);
            this.updateVotingDisplay(this.defaultVoting);
        }
    }
    
    async waitForFirebaseServices() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkServices = () => {
                if (window.firebaseServices) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Firebase services not available'));
                } else {
                    attempts++;
                    setTimeout(checkServices, 100);
                }
            };
            
            checkServices();
        });
    }
    
    setupAuthListener() {
        if (window.firebaseServices?.authService?.onAuthStateChanged) {
            window.firebaseServices.authService.onAuthStateChanged((user) => {
                this.currentUser = user;
                console.log('Auth state changed:', user ? 'Signed in' : 'Signed out');
            });
        }
    }
    
    startStatsListener() {
        if (window.firebaseServices?.statsService?.onStatsChange) {
            this.statsUnsubscribe = window.firebaseServices.statsService.onStatsChange((stats) => {
                this.updateStatsDisplay(stats);
            });
        }
    }
    
    startVotingListener() {
        if (window.firebaseServices?.votingService?.onVotingChange) {
            this.votingUnsubscribe = window.firebaseServices.votingService.onVotingChange((voting) => {
                this.updateVotingDisplay(voting);
            });
        }
    }
    
    updateStatsDisplay(stats) {
        try {
            // Update hero stats
            this.updateElement('.stat-number', (element, index) => {
                const values = [
                    stats.preOrders?.toLocaleString() || this.defaultStats.preOrders.toLocaleString(),
                    `${stats.rating || this.defaultStats.rating}★`,
                    `${stats.countries || this.defaultStats.countries}+`
                ];
                if (values[index]) {
                    element.textContent = values[index];
                }
            });
            
            // Update voting stats total
            const totalVotes = stats.totalVotes || this.defaultStats.totalVotes;
            this.updateSingleElement('.vote-stat-number', totalVotes.toLocaleString());
            
            // Update pain point stats if they exist
            if (stats.painPointStats) {
                this.updateElement('.pain-stat-number', (element, index) => {
                    const painValues = Object.values(stats.painPointStats);
                    if (painValues[index]) {
                        element.textContent = painValues[index];
                    }
                });
            }
            
            console.log('Stats display updated:', stats);
            
        } catch (error) {
            console.error('Error updating stats display:', error);
        }
    }
    
    updateVotingDisplay(voting) {
        try {
            // Update total votes
            const totalVotes = voting.totalVotes || this.defaultVoting.totalVotes;
            
            // Find all voting-related elements
            const voteElements = document.querySelectorAll('.vote-stat-number');
            voteElements.forEach((element, index) => {
                if (index === 0) { // First element is total votes
                    element.textContent = totalVotes.toLocaleString();
                }
            });
            
            // Update leading product
            if (voting.products) {
                const products = Object.entries(voting.products);
                const leadingProduct = products.reduce((leader, [key, product]) => {
                    return (product.votes > leader.votes) ? { key, ...product } : leader;
                }, { votes: 0, name: 'Handle' });
                
                const leadingElements = document.querySelectorAll('.vote-stat-number');
                if (leadingElements[1]) {
                    leadingElements[1].textContent = leadingProduct.name;
                }
                
                // Calculate completion rate (example metric)
                const completionRate = Math.min(Math.round((totalVotes / 5000) * 100), 100);
                if (leadingElements[2]) {
                    leadingElements[2].textContent = `${completionRate}%`;
                }
            }
            
            console.log('Voting display updated:', voting);
            
        } catch (error) {
            console.error('Error updating voting display:', error);
        }
    }
    
    updateElement(selector, callback) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            callback(element, index);
        });
    }
    
    updateSingleElement(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }
    
    // Public methods for manual updates (admin use)
    async incrementPreOrders() {
        if (!this.isInitialized) return;
        
        try {
            if (window.firebaseServices?.statsService?.incrementPreOrders) {
                await window.firebaseServices.statsService.incrementPreOrders();
                console.log('Pre-orders incremented');
            }
        } catch (error) {
            console.error('Error incrementing pre-orders:', error);
        }
    }
    
    async updateProductSales(productId, quantity = 1) {
        if (!this.isInitialized) return;
        
        try {
            if (window.firebaseServices?.statsService?.updateProductSales) {
                await window.firebaseServices.statsService.updateProductSales(productId, quantity);
                console.log(`Product sales updated: ${productId} +${quantity}`);
            }
        } catch (error) {
            console.error('Error updating product sales:', error);
        }
    }
    
    async submitVote(productId) {
        if (!this.isInitialized || !this.currentUser) {
            throw new Error('Authentication required to vote');
        }
        
        try {
            if (window.firebaseServices?.votingService?.submitVote) {
                await window.firebaseServices.votingService.submitVote(productId, this.currentUser);
                console.log(`Vote submitted for: ${productId}`);
                return true;
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            throw error;
        }
    }
    
    async hasUserVoted() {
        if (!this.isInitialized || !this.currentUser) return false;
        
        try {
            if (window.firebaseServices?.votingService?.hasUserVoted) {
                return await window.firebaseServices.votingService.hasUserVoted(this.currentUser);
            }
        } catch (error) {
            console.error('Error checking vote status:', error);
            return false;
        }
    }
    
    async getUserVote() {
        if (!this.isInitialized || !this.currentUser) return null;
        
        try {
            if (window.firebaseServices?.votingService?.getUserVote) {
                return await window.firebaseServices.votingService.getUserVote(this.currentUser);
            }
        } catch (error) {
            console.error('Error getting user vote:', error);
            return null;
        }
    }
    
    // Admin methods
    async updateStats(updates) {
        if (!this.isInitialized || !this.currentUser) {
            throw new Error('Authentication required');
        }
        
        try {
            if (window.firebaseServices?.statsService?.updateStats) {
                await window.firebaseServices.statsService.updateStats(updates, this.currentUser);
                console.log('Stats updated by admin:', updates);
            }
        } catch (error) {
            console.error('Error updating stats:', error);
            throw error;
        }
    }
    
    async resetVoting() {
        if (!this.isInitialized || !this.currentUser) {
            throw new Error('Authentication required');
        }
        
        try {
            if (window.firebaseServices?.votingService?.resetVoting) {
                await window.firebaseServices.votingService.resetVoting(this.currentUser);
                console.log('Voting reset by admin');
            }
        } catch (error) {
            console.error('Error resetting voting:', error);
            throw error;
        }
    }
    
    async toggleVotingStatus() {
        if (!this.isInitialized || !this.currentUser) {
            throw new Error('Authentication required');
        }
        
        try {
            if (window.firebaseServices?.votingService?.toggleVotingStatus) {
                await window.firebaseServices.votingService.toggleVotingStatus(this.currentUser);
                console.log('Voting status toggled by admin');
            }
        } catch (error) {
            console.error('Error toggling voting status:', error);
            throw error;
        }
    }
    
    // Cleanup
    destroy() {
        if (this.statsUnsubscribe) {
            this.statsUnsubscribe();
            this.statsUnsubscribe = null;
        }
        
        if (this.votingUnsubscribe) {
            this.votingUnsubscribe();
            this.votingUnsubscribe = null;
        }
        
        console.log('DAMP Real-time Stats destroyed');
    }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    // Make it globally available
    window.DAMPRealtimeStats = DAMPRealtimeStats;
    
    // Auto-initialize on pages that need it
    document.addEventListener('DOMContentLoaded', () => {
        // Only initialize on pages with stats
        if (document.querySelector('.stat-number') || document.querySelector('.vote-stat-number')) {
            window.dampRealtimeStats = new DAMPRealtimeStats();
            
            // Add global helper functions
            window.dampStatsHelpers = {
                incrementPreOrders: () => window.dampRealtimeStats?.incrementPreOrders(),
                updateProductSales: (productId, quantity) => window.dampRealtimeStats?.updateProductSales(productId, quantity),
                submitVote: (productId) => window.dampRealtimeStats?.submitVote(productId),
                hasUserVoted: () => window.dampRealtimeStats?.hasUserVoted(),
                getUserVote: () => window.dampRealtimeStats?.getUserVote()
            };
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.dampRealtimeStats) {
            window.dampRealtimeStats.destroy();
        }
    });
}

export default DAMPRealtimeStats; 