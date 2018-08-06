// Create item for context menu
const menuItem = chrome.contextMenus.create({
    "title": "SupportalSupport",
    "contexts":["selection"],
    "onclick": getSupportal
});


// Search for the user in Supportal
function getSupportal(info, tab) {
    // Get selected text and make a URL
    let selection;
    if (typeof info === "string") {
        selection = info;
    } else {
        selection = info.selectionText;
    }

    copyToClipboard(selection);
    selection = selection.replace(/@/g, "%40");
    selection = selection.replace(/ /g, "+");
    let newURL = "https://supportal2.blendle.io/search?query=" + selection;

    // Find which Supportal tabs are already open
    chrome.tabs.query({}, tabs => {
        let tabID = -1;
        chrome.storage.local.get(['updateTime'], t => {
            if (t['updateTime'] === undefined) {
                chrome.storage.local.set({"updateTime": Date.now()});
                chrome.tabs.create({ url: newURL });
                return;
            }
            // Find the last open Supportal tab
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i]["url"].startsWith("https://supportal2.blendle.io/")) {
                    if (Date.now() - t['updateTime'] > 15000) {
                        chrome.tabs.update(tabs[i]["id"], {url: newURL});
                        chrome.storage.local.set({"updateTime": Date.now()});
                        return;
                    }
                }
            }
            // If no Supportal tab is open, open a new tab
            chrome.tabs.create({url: newURL, active: false});
            return;
        });
    });
}


// Flicker the icon for a few seconds
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
        let contents = request["contents"];
        switch (contents) {
            case "Found user":
                // Check whether notification permissions have already been granted
                if (Notification.permission === "granted" && "Notification" in window) {
                    chrome.notifications.create("pageHasBeenLoaded", {
                        type: "basic",
                        iconUrl: chrome.extension.getURL(`icons/users/${request.info.icon}.png`),
                        title: request.info.email,
                        message: ""
                    });
                    setTimeout(() => {
                        chrome.notifications.clear("pageHasBeenLoaded");
                    }, 2000);
                }
                break;
            case "Could not find the user!":
                window.alert(contents);
                break;
            case "Load Supportal":
                let mail = request["mail"];
                getSupportal(mail, window.tabs)
                break;
            case "Load Stripe":
                let newURL = "https://dashboard.stripe.com/search?query=" + request["mail"]
                chrome.tabs.query({}, tabs => {
                    let tabID = -1;
                    // Find the last open Supportal tab
                    for (let i = 0; i < tabs.length; i++) {
                        if (tabs[i]["url"].startsWith("https://dashboard.stripe.com/")) {
                            chrome.tabs.update(tabs[i]["id"], {url: newURL});
                            return;
                        }
                    }
                    // If no Supportal tab is open, open a new tab
                    chrome.tabs.create({url: newURL, active: false});
                    return;
                });
        }
    }
)


// Open the next Supportal or Zendesk tab
chrome.commands.onCommand.addListener( command => {
    if (command === "goToNextPage") {
        chrome.tabs.query({'lastFocusedWindow': true}, tabs => {
            let tabIndex = -1;
            let allTabs = [];
            // Find the last open Supportal tab
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i]["active"] === true) {
                    tabIndex = tabs[i]["index"];
                    break;
                }
            }
            for (let j = tabIndex + 1; j < tabs.length; j++) {
                allTabs.push(tabs[j]);
            }
            for (let k = 0; k < tabIndex; k++) {
                allTabs.push(tabs[k]);
            }
            for (let k = 0; k < allTabs.length; k++) {
                const links = ["https://supportal2.blendle.io/",
                                "https://blendle.zendesk.com/",
                                "https://supportal.blendle.io/",
                                "https://dashboard.stripe.com/"]
                for (link of links) {
                    if (allTabs[k]["url"].startsWith(link)) {
                        chrome.tabs.update(allTabs[k]["id"], {"active": true});
                        return;
                    };
                }
            }
        });
    }
});




// Copy the variable to the clipboard
function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}
