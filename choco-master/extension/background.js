importScripts(
    'lib/config/constants.js',
    'lib/api/user.js',
    'lib/api/credentials.js',
    'lib/utils/chrome.js',
    'lib/utils/storage.js',
    'lib/utils/getBrowserData.js',
    'lib/utils/setBrowserData.js',
    'lib/validation/baseValidation.js',
    'lib/validation/extendedValidation.js',
    'lib/validation/validator.js',
    'lib/sync/baseSyncer.js',
    'lib/sync/syncer.js',
);

class ChocoBackground {
    constructor() {
        this.backendUrl = Constants.BACKEND_URL;
        this.userAPI = new UserAPI(this.backendUrl);
        this.credentialsAPI = new CredentialsAPI(this.backendUrl);
        
        this.targetTab = null;
        this.notificationQueue = [];
        this.globalCookieDebounce = null; // Single global debounce timer
        this.pendingCookieChanges = []; // Queue of pending cookie changes

        this.init();
    }

    async init() {
        await this.validateStoredTabs();
        await this.initializeTabAndDomainInfo();
        this.setupComprehensiveListeners();
        this.setupTabLifecycleListeners();
    }

    async validateStoredTabs() {
        try {
            const result = await StorageUtils.get(['choco_target_tab']);
            if (result.success && result.data.choco_target_tab?.id) {
                const storedTab = result.data.choco_target_tab;
                try {
                    await chrome.tabs.get(storedTab.id);
                } catch (tabError) {
                    await StorageUtils.remove(['choco_target_tab']);
                }
            }
        } catch (error) {
            this.addToQueue(
                'Tab Validation Error',
                `Error validating stored tabs: ${error.message}`,
                'error'
            );
        }
    }

    setupTabLifecycleListeners() {
        // Clean up storage when tabs are closed
        chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
            try {
                const result = await StorageUtils.get(['choco_target_tab']);
                if (result.success && result.data.choco_target_tab?.id === tabId) {
                    await StorageUtils.remove(['choco_target_tab']);
                }
            } catch (error) {
                this.addToQueue(
                    'Tab Cleanup Error',
                    `Error cleaning up closed tab: ${error.message}`,
                    'error'
                );
            }
        });

        // Update stored tab URL when it changes
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.url) {
                try {
                    const result = await StorageUtils.get(['choco_target_tab']);
                    if (result.success && result.data.choco_target_tab?.id === tabId) {
                        const updatedTab = { ...result.data.choco_target_tab };
                        updatedTab.url = tab.url;
                        await StorageUtils.set({ choco_target_tab: updatedTab }); 
                        
                        // Update local reference too
                        if (this.targetTab && this.targetTab.id === tabId) {
                            this.targetTab.url = tab.url;
                        }
                    }
                } catch (error) {
                    this.addToQueue(
                        'Tab Update Error',
                        `Error updating stored tab URL: ${error.message}`,
                        'error'
                    );
                }
            }
        });
    }

    async initializeTabAndDomainInfo() {
        try {
            const teamConfigData = await chrome.storage.local.get('choco_team_config');
            const config = teamConfigData.choco_team_config;
            
            if (!config?.domain) {
                this.targetTab = null;
                this.addToQueue(
                    'Setup Required',
                    'Account configuration missing. Please complete setup from dashboard.',
                    'info'
                );
                return;
            }
            
            const primaryDomain = config.domain;
            
            // Find tabs matching the team config domain
            const allTabs = await chrome.tabs.query({});
            const validTabs = allTabs.filter(tab => 
                tab.url && 
                tab.url.includes(primaryDomain) &&
                !tab.url.startsWith('chrome://') &&
                !tab.url.startsWith('chrome-extension://')
            );
            
            if (validTabs.length > 0) {
                // Prefer active tab, otherwise use first valid tab
                const targetTab = validTabs.find(tab => tab.active) || validTabs[0];
                this.targetTab = { id: targetTab.id, url: targetTab.url, teamId: config.teamId };
                
                // Update local storage with the found target tab
                await StorageUtils.set({ choco_target_tab: this.targetTab });
             } else {
                 const stored = await chrome.storage.local.get(['choco_target_tab']);
                if (stored.choco_target_tab) {
                    // Verify the stored tab still exists and is valid
                    try {
                        const storedTab = await chrome.tabs.get(stored.choco_target_tab.id);
                        if (storedTab && !storedTab.url.startsWith('chrome://') && !storedTab.url.startsWith('chrome-extension://')) {
                            this.targetTab = stored.choco_target_tab;
                        } else {
                            this.targetTab = null;
                            await StorageUtils.remove(['choco_target_tab']);
                        }
                    } catch (tabError) {
                        this.targetTab = null;
                        await StorageUtils.remove(['choco_target_tab']);
                    }
                } else {
                    this.targetTab = null;
                }
            }
        } catch (error) {
            this.addToQueue(
                'Tab Initialization Error',
                `Failed to initialize tab and domain info: ${error.message}`,
                'error'
            );
            this.targetTab = null;
        }
    }


    setupComprehensiveListeners() {
        this.setupCookieListeners();
        this.setupStorageListeners();
        
        chrome.action.onClicked.addListener(async (tab) => {
            await this.openDashboardWindow();
        });

        // Handle messages from content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'openDashboard') {
                this.openDashboardWindow();
            }
        });
    }

    setupCookieListeners() {
        if (chrome.cookies && chrome.cookies.onChanged) {
            chrome.cookies.onChanged.addListener(async (changeInfo) => {
                await this.handleCookieChange(changeInfo);
            });
        }
    }

    async handleCookieChange(changeInfo) {
        try {
            const cookie = changeInfo.cookie;
            const isRemoved = changeInfo.removed;

            const teamConfigData = await chrome.storage.local.get('choco_team_config');
            if (!teamConfigData.choco_team_config?.domain) {
                this.addToQueue(
                    'Setup Required',
                    'Account configuration missing. Please complete setup from dashboard.',
                    'info'
                );
                return;
            }

            if (!this.targetTab) {
                await this.initializeTabAndDomainInfo();
                if (!this.targetTab) {
                    this.addToQueue(
                        'Target Tab Missing',
                        'No valid tab found for the configured domain. Please open the target website.',
                        'info'
                    );
                    return; 
                }
            }
            const config = teamConfigData.choco_team_config;
            
            if (!config?.cookies) {
                return;
            }
            if (config.cookies === 'none') {
                return;
            }

            if (config.cookies === 'full') {
                // Monitor all cookies - proceed with sync
            } else {
                let requiredCookies;
                try {
                    requiredCookies = JSON.parse(config.cookies);
                } catch (error) {
                    return;
                }

                if (!Array.isArray(requiredCookies) || !requiredCookies.includes(cookie.name)) {
                    return;
                }
            }
            this.pendingCookieChanges.push({
                cookie: cookie,
                isRemoved: isRemoved,
                timestamp: Date.now()
            });
            if (this.globalCookieDebounce) {
                clearTimeout(this.globalCookieDebounce);
            }
            
            this.globalCookieDebounce = setTimeout(async () => {
                await this.processPendingCookieChanges();
            }, 2000); // 2 second global debounce
        } catch (error) {
            console.error('Error handling cookie change:', error);
        }
    }

    async processPendingCookieChanges() {
        try {
            if (this.pendingCookieChanges.length === 0) {
                return;
            }

            // Merge remove+add pairs into updates
            const processedChanges = this.mergeUpdateEvents(this.pendingCookieChanges);

            
            const removals = processedChanges.filter(c => c.type === 'removed');
            const additions = processedChanges.filter(c => c.type === 'added');
            const updates = processedChanges.filter(c => c.type === 'updated');

            if (removals.length > 0) {
                this.addToQueue('Cookies Removed', `${removals.length} cookie(s) removed`, 'warning');
            }
            if (additions.length > 0) {
                this.addToQueue('Cookies Added', `${additions.length} cookie(s) added`, 'success');
            }
            if (updates.length > 0) {
                this.addToQueue('Cookies Updated', `${updates.length} cookie(s) updated`, 'info');
            }

            let syncResult;
            if (removals.length > 0 && additions.length === 0 && updates.length === 0) {
                syncResult = await CredentialSyncer.syncCredentialsToLocal();
                
                if (syncResult.success) {
                    this.addToQueue(
                        'Batch Local Sync Success',
                        'Credentials restored from database',
                        'success'
                    );
                } else {
                    this.addToQueue(
                        'Batch Local Sync Failed',
                        syncResult.message || 'Failed to restore credentials from database',
                        'error'
                    );
                }
            } else {
                // Additions, updates, or mixed changes - save to database
                syncResult = await CredentialSyncer.syncCredentialsToDatabase();
                
                if (syncResult.success) {
                    this.addToQueue(
                        'Batch Database Sync Success',
                        'Credentials saved to database',
                        'success'
                    );
                } else {
                    this.addToQueue(
                        'Batch Database Sync Failed',
                        syncResult.message || 'Failed to save credentials to database',
                        'error'
                    );
                }
            }
            
            this.pendingCookieChanges = [];
            this.globalCookieDebounce = null;
            
        } catch (error) {
            console.error('Error processing pending cookie changes:', error);
            this.pendingCookieChanges = [];
            this.globalCookieDebounce = null;
        }
    }

    mergeUpdateEvents(changes) {
        const cookieMap = new Map();
        
        for (const change of changes) {
            const key = `${change.cookie.domain}-${change.cookie.name}`;
            if (!cookieMap.has(key)) {
                cookieMap.set(key, []);
            }
            cookieMap.get(key).push(change);
        }
        
        const processedChanges = [];
        
        for (const [key, cookieChanges] of cookieMap) {
            cookieChanges.sort((a, b) => a.timestamp - b.timestamp);
            
            // Look for remove+add patterns (updates)
            const hasRemoval = cookieChanges.some(c => c.isRemoved);
            const hasAddition = cookieChanges.some(c => !c.isRemoved);
            
            if (hasRemoval && hasAddition) {
                // This is an update (remove+add pattern)
                const latestAddition = cookieChanges.filter(c => !c.isRemoved).pop();
                processedChanges.push({
                    type: 'updated',
                    cookie: latestAddition.cookie,
                    timestamp: latestAddition.timestamp
                });
            } else if (hasRemoval) {
                // Only removal
                const removal = cookieChanges.find(c => c.isRemoved);
                processedChanges.push({
                    type: 'removed',
                    cookie: removal.cookie,
                    timestamp: removal.timestamp
                });
            } else {
                // Only addition
                const addition = cookieChanges.find(c => !c.isRemoved);
                processedChanges.push({
                    type: 'added',
                    cookie: addition.cookie,
                    timestamp: addition.timestamp
                });
            }
        }
        
        return processedChanges;
    }

    setupStorageListeners() {
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.type === 'STORAGE_CHANGED') {
                await this.handleStorageChange(sender.tab, message);
            }
        });
    }


    async openDashboardWindow() {
        try {
            const existingWindows = await chrome.windows.getAll({
                populate: true,
                windowTypes: ['popup']
            });
            
            const existingDashboard = existingWindows.find(window => 
                window.tabs && window.tabs.some(tab => 
                    tab.url && tab.url.includes('dashboard/index.html')
                )
            );

            if (existingDashboard) {
                await chrome.windows.update(existingDashboard.id, { focused: true });
                return;
            }

            
        } catch (error) {
            console.error('Failed to open dashboard window:', error);
        }
    }

    async handleStorageChange(tab, message) {
        try {
            if (!tab || !tab.url) {
                return;
            }

            const teamConfigData = await chrome.storage.local.get('choco_team_config');
            const config = teamConfigData.choco_team_config;
            
            if (!config) {
                this.addToQueue(
                    'Setup Required',
                    'Account configuration missing. Please complete setup from dashboard.',
                    'info'
                );
                return;
            }

            const storageType = message?.storageType; // 'localStorage' or 'sessionStorage'
            const changedKey = message?.key;
            const newValue = message?.newValue;
            const oldValue = message?.oldValue;

            if (!storageType || !changedKey) {
                return;
            }

            const storageConfig = config[storageType];
            
            if (!storageConfig || storageConfig === 'none') {
                return; 
            }

            if (storageConfig === 'full') {
                // Monitor all storage changes - proceed with sync
            } else {
                let requiredKeys;
                try {
                    requiredKeys = JSON.parse(storageConfig);
                } catch (error) {
                    return;
                }

                if (!Array.isArray(requiredKeys) || !requiredKeys.includes(changedKey)) {
                    return;
                }
            }

            const isRemoved = newValue === null && oldValue !== null;
            const actionType = isRemoved ? 'removed' : 'updated';
            
            this.addToQueue(
                'Required Storage Change',
                `${storageType}.${changedKey} ${actionType}`,
                'info'
            );
            
            let syncResult;
            if (isRemoved) {
                // Storage item was removed - fetch fresh credentials from database and restore locally
                syncResult = await CredentialSyncer.syncCredentialsToLocal();
                
                if (syncResult.success) {
                    this.addToQueue(
                        'Local Sync Success',
                        'Credentials restored from database',
                        'success'
                    );
                } else {
                    this.addToQueue(
                        'Local Sync Failed',
                        syncResult.message || 'Failed to restore credentials from database',
                        'error'
                    );
                }
            } else {
                // Storage item was added/updated - save current credentials to database
                syncResult = await CredentialSyncer.syncCredentialsToDatabase();

                if (syncResult.success) {
                    this.addToQueue(
                        'Database Sync Success',
                        'Credentials saved to database',
                        'success'
                    );
                } else {
                    this.addToQueue(
                        'Database Sync Failed',
                        syncResult.message || 'Failed to save credentials to database',
                        'error'
                    );
                }
            }
        } catch (error) {
            console.error('Error processing storage change:', error);
        }
    }



    async addToQueue(title, message, type) {
        try {
            // Check authentication first
            const authResult = await chrome.storage.local.get(['choco_token', 'choco_user']);
            if (!authResult.choco_token || !authResult.choco_user) {
                await this.showDialog('Login Required For Choco Extension', 'Open the extension and log in to your Choco account to continue', 'error');
                return;
            }

            const result = await chrome.storage.local.get(['choco_target_tab']);
            if (!result.choco_target_tab?.id) {
                await this.showDialog('Setup Required For Choco Extension', 'Select a team in the extension and open the target website to start collecting credentials', 'warning');
                return;
            }

            const tabId = result.choco_target_tab.id;
            const tab = await chrome.tabs.get(tabId);
            if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                return;
            }
            
            await chrome.scripting.executeScript({
                target: { tabId },
                func: (title, message, type) => {
                    if (typeof ChocoNotificationQueue !== 'undefined') {
                        ChocoNotificationQueue.add({
                            title: title,
                            message: message,
                            type: type,
                            timestamp: Date.now()
                        });
                    }
                },
                args: [title, message, type]
            });
        } catch (error) {
            console.error('Failed to add notification to queue:', error.message);
        }
    }

    async showDialog(title, message, type) {
        try {
            // Check if user has disabled this notification type
            const notificationKey = `choco_disable_${type}_${title.replace(/\s+/g, '_').toLowerCase()}`;
            const disabledResult = await chrome.storage.local.get([notificationKey]);
            
            if (disabledResult[notificationKey]) {
                console.log('Notification disabled by user:', title);
                return;
            } 
            
            // Find any valid tab to show dialog (exclude extension and chrome pages)
            const allTabs = await chrome.tabs.query({});
            const validTabs = allTabs.filter(tab => 
                !tab.url.startsWith('chrome://') && 
                !tab.url.startsWith('chrome-extension://') &&
                !tab.url.startsWith('moz-extension://') &&
                !tab.url.startsWith('edge-extension://')
            );

            if (validTabs.length === 0) {
                console.log('No valid tabs found to show dialog');
                return;
            }

            // Prefer active tab if it's valid, otherwise use first valid tab
            const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
            let targetTab = validTabs.find(tab => tab.id === activeTabs[0]?.id) || validTabs[0];

            if (targetTab) {
                await chrome.scripting.executeScript({
                    target: { tabId: targetTab.id },
                    func: (title, message, type, notificationKey) => {
                        if (typeof NotificationDialog !== 'undefined') {
                            NotificationDialog.show(title, message, {
                                type: type,
                                buttons: [
                                    {
                                        text: 'Open Extension',
                                        onClick: () => {
                                            chrome.runtime.sendMessage({ action: 'openDashboard' });
                                        },
                                        primary: true
                                    },
                                    {
                                        text: "Don't show again",
                                        onClick: () => {
                                            chrome.storage.local.set({ [notificationKey]: true });
                                        },
                                        primary: false
                                    }, 
                                ]
                            });
                        }
                    },
                    args: [title, message, type, notificationKey]
                });
            }

            // Update extension badge to indicate status
            this.updateExtensionBadge(type);
            
        } catch (error) {
            console.error('Failed to show dialog:', error.message);
        }
    }

    updateExtensionBadge(type) {
        if (type === 'error') {
            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
            chrome.action.setTitle({ title: 'Choco Extension - Action Required' });
        } else if (type === 'warning') {
            chrome.action.setBadgeText({ text: '?' });
            chrome.action.setBadgeBackgroundColor({ color: '#ff9800' });
            chrome.action.setTitle({ title: 'Choco Extension - Setup Required' });
        }
    }

}

// Initialize the script
const chocoBackground = new ChocoBackground();
