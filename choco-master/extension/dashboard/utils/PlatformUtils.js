class PlatformUtils {
    static getPlatformDisplayName(domainKey) {
        return Constants.DOMAINS[domainKey]?.DISPLAY_NAME || domainKey;
    }

    static getPlatformIcon(domainKey) {
        return Constants.DOMAINS[domainKey]?.ICON || '🌐';
    }

    static async findSupportedTabs() {
        const supportedTabs = [];
        
        // Always create platforms from ALL domains in Constants
        if (typeof Constants !== 'undefined' && Constants.DOMAINS) {
            Object.entries(Constants.DOMAINS).forEach(([key, domain]) => {
                supportedTabs.push({
                    tab: { id: Math.random(), url: domain.URL, title: domain.DISPLAY_NAME },
                    domainConfig: { key, domain },
                    platformName: domain.DISPLAY_NAME,
                    platformIcon: domain.ICON
                });
            });
        } else {
            console.error('Constants.DOMAINS not available');
        }
        
        return supportedTabs;
    }

    static async initializeTabAndDomainInfo() {
        const supportedTabs = await this.findSupportedTabs();
        
        // Filter to only include the current active tab if it's supported
        let currentTabPlatforms = [];
        
        try {
            // Get all tabs, not just current window (extension popup is in different window)
            const allTabs = await chrome.tabs.query({});
            
            // Find the most recently active non-extension tab
            const browserTabs = allTabs.filter(tab => 
                !tab.url.startsWith('chrome-extension://') && 
                !tab.url.startsWith('chrome://') &&
                !tab.url.startsWith('moz-extension://')
            );
            
            // Sort by last accessed time or find active tab in other windows
            const activeBrowserTab = browserTabs.find(tab => tab.active) || 
                                   browserTabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
            
            if (activeBrowserTab) {
                
                // Check if browser tab URL matches any supported platform domain
                const currentTabPlatform = supportedTabs.find(platform => {
                    const primaryDomain = platform.domainConfig.domain.PRIMARY;
                    
                    // Check if browser tab URL contains the primary domain
                    const matches = activeBrowserTab.url && activeBrowserTab.url.includes(primaryDomain);
                    
                    return matches;
                });
                
                if (currentTabPlatform) {
                    // Update the platform with actual browser tab info
                    currentTabPlatform.tab = activeBrowserTab;
                    currentTabPlatforms = [currentTabPlatform];
                } else {
                }
            } else {
            }
        } catch (error) {
            console.error('Failed to get tabs:', error);
        }
        
        // Return current tab platform if found, otherwise all supported tabs
        const finalPlatforms = currentTabPlatforms.length > 0 ? currentTabPlatforms : supportedTabs;
        
        return {
            supportedTabs: finalPlatforms,
            hasSupported: finalPlatforms.length > 0,
            hasSingle: finalPlatforms.length === 1,
            hasMultiple: finalPlatforms.length > 1,
            isCurrentTab: currentTabPlatforms.length > 0
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.PlatformUtils = PlatformUtils;
}
