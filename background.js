// Create item for context menu
const menuItem = chrome.contextMenus.create({
    "title": "SupportalSupport",
    "contexts":["selection"],
    "onclick": getSupportal
});


// Search for the user in Supportal
function getSupportal(info, tab) {
    // Get selected text and make a URL
    let selection = info.selectionText;
    copyToClipboard(selection);
    selection = selection.replace(/@/g, "%40");
    selection = selection.replace(/ /g, "+");
    let newURL = "https://supportal2.blendle.io/search?query=" + selection;

    // Find which Supportal tabs are already open
    chrome.tabs.query({}, function(tabs) {
        let tabID = -1;
        // Find the last open Supportal tab
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i]["url"].startsWith("https://supportal2.blendle.io/")) {
                chrome.tabs.update(tabs[i]["id"], {url: newURL});
                return;
            };
        };
        // If no Supportal tab is open, open a new tab
        chrome.tabs.create({ url: newURL });
        return;
    });
};


// Flicker the icon for a few seconds
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request["gotContent"] === true) {
            let n = 0;
            let m = 0;
            const flicker = setInterval(function() {
                n++;
                chrome.browserAction.setIcon({path: `icons/gif/icon_128_${n}.png`});
                if (n === 11) {
                    m++;
                    n = 0;
                };
            }, 50);
            setTimeout(function() {
                clearInterval(flicker);
                chrome.browserAction.setIcon({path: "icons/grey/icon_16.png"});
                // chrome.browserAction.setBadgeText({text: "abc"});
            }, 2500);
        };
    }
);


// Copy the variable to the clipboard
function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
};
