/* ============================================
   Global API Configuration
   ============================================ */

// Vercel deployment domain - change to your actual domain
const API_CONFIG = {
    // Vercel API base URL
    BASE_URL: process.env.VERCEL_API_BASE || 'https://project-folder-1.vercel.app',
    
    // API endpoints
    endpoints: {
        GEMINI: '/api/gemini',
        SMART_GENERATE: '/api/smart-generate',
        REFINE_PROMPT: '/api/refine-prompt',
        IMAGE_SCAN: '/api/image-scan'
    },
    
    // Helper functions
    getFullUrl: (endpoint) => {
        const url = API_CONFIG.endpoints[endpoint];
        if (!url) {
            console.warn(`⚠️ Unknown endpoint: ${endpoint}`);
            return '';
        }
        return `${API_CONFIG.BASE_URL}${url}`;
    },
    
    // Helper for fetch with error handling
    async fetch(endpoint, options = {}) {
        const url = this.getFullUrl(endpoint);
        if (!url) return null;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                console.error(`❌ API Error [${endpoint}]:`, response.status, response.statusText);
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error(`❌ Fetch Error [${endpoint}]:`, error);
            return null;
        }
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
