// Sledování otevřených tabů a automatické zavírání lms.skoda.vwgroup.com a digiskills.cz
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && (changeInfo.url.includes('lms.skoda.vwgroup.com') || changeInfo.url.includes('digiskills.cz'))) {
        console.log('🚫 Blokuji nežádoucí URL, zavírám tab:', tabId);
        chrome.tabs.remove(tabId);
    }
});

// Zachytávání nově vytvořených tabů
chrome.tabs.onCreated.addListener((tab) => {
    if (tab.url && (tab.url.includes('lms.skoda.vwgroup.com') || tab.url.includes('digiskills.cz'))) {
        console.log('🚫 Blokuji nový tab s nežádoucí URL:', tab.id);
        chrome.tabs.remove(tab.id);
    }
    
    // Kontrola po krátkém timeoutu (pro případy, kdy URL není hned dostupná)
    setTimeout(() => {
        chrome.tabs.get(tab.id, (updatedTab) => {
            if (chrome.runtime.lastError) return;
            if (updatedTab.url && (updatedTab.url.includes('lms.skoda.vwgroup.com') || updatedTab.url.includes('digiskills.cz'))) {
                console.log('🚫 Blokuji tab s nežádoucí URL (delayed check):', tab.id);
                chrome.tabs.remove(tab.id);
            }
        });
    }, 100);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'FOCUS_MAIN_TAB') {
        // Fokusování vypnuto na žádost uživatele, aby okno nevyskakovalo z minimalizace.
        /*
        chrome.tabs.query({}, (tabs) => {
            ...
        });
        */
        return true;
    }
});
