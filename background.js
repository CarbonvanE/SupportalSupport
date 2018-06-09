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
        chrome.storage.local.get(['updateTime'], function(t) {
            if (t['updateTime'] === undefined) {
                chrome.storage.local.set({"updateTime": Date.now()});
                chrome.tabs.create({ url: newURL });
                return;
            }
            // Find the last open Supportal tab
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i]["url"].startsWith("https://supportal2.blendle.io/")) {
                    if (Date.now() - t['updateTime'] > 10000) {
                        chrome.tabs.update(tabs[i]["id"], {url: newURL});
                        chrome.storage.local.set({"updateTime": Date.now()});
                        return;
                    };
                };
            };
            // If no Supportal tab is open, open a new tab
            chrome.tabs.create({url: newURL, active: false});
            return;
        });
    });
};


// Flicker the icon for a few seconds
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // Check whether notification permissions have already been granted
        if (request["gotContent"] === true) {
            if (Notification.permission === "granted" && "Notification" in window) {
                chrome.notifications.create("pageHasBeenLoaded", {
                    type: "basic",
                    iconUrl: chrome.extension.getURL(`icons/users/${request["info"]["icon"]}.png`),
                    title: request["info"]["email"],
                    message: ""
                });
                setTimeout(function() {
                    chrome.notifications.clear("pageHasBeenLoaded");
                }, 3000)
            }
        } else if (request["gotContent"] === false){
            window.alert("Could not find the user!")
        } else {
            let usersFound = request["gotContent"]
            let message = "There were " + usersFound.length + " users found\n\n"
            for (let i = 0; (i < usersFound.length && i < 20); i++) {
                message += usersFound[i].split(" ")[0] + "\n"
            }
            if (usersFound.length >= 20) {
                message += "..."
            }
            window.alert(message);
        }
    }
);


// Open the next Supportal or Zendesk tab
chrome.commands.onCommand.addListener(function(command) {
    if (command == "goToNextPage") {
        chrome.tabs.query({}, function(tabs) {
            let tabIndex = -1;
            let allTabs = []
            // Find the last open Supportal tab
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i]["active"] === true) {
                    tabIndex = tabs[i]["index"];
                    break;
                }
            };
            for (let j = tabIndex + 1; j < tabs.length; j++) {
                allTabs.push(tabs[j])
            }
            for (let k = 0; k < tabIndex; k++) {
                allTabs.push(tabs[k])
            }
            for (let k = 0; k < allTabs.length; k++) {
                if (allTabs[k]["url"].startsWith("https://supportal2.blendle.io/") || allTabs[k]["url"].startsWith("https://blendle.zendesk.com/") || allTabs[k]["url"].startsWith("https://supportal.blendle.io/")) {
                    chrome.tabs.update(allTabs[k]["id"], {"active": true});
                    return;
                };
            }
        });
    };
});



// Copy the variable to the clipboard
function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
};
