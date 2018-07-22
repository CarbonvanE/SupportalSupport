// Update the popup page
function updatePopup(user, tab) {
    // Change tab color
    for (let i = 1; i <= 7; i++) {
        document.querySelector(".tab" + i).classList.remove("tabSelected");
    }
    document.querySelector(".tab" + tab).classList.add("tabSelected");
    document.querySelector("#unsubAll").style.display = "block";

    // Change user info that's being displayed
    document.querySelector("#name").textContent = user.name;
    document.querySelector("#saldo").textContent = user.saldo;
    document.querySelector("#userSince").textContent = "User since " + user.signUpDate;
    document.querySelector("#articlesRead").textContent = isItSingle(user.reads, "article", "read");
    document.querySelector("#transactions").textContent = isItSingle(user.transactions, "transaction", "");
    document.querySelector("#emailSubs").textContent = isItSingle(user.emailSubs, "email subscription", "");
    document.querySelector("#activeSubs").textContent = isItSingle(user.activeSubs, "active subscription", "");
    document.querySelector("#endOfSub").textContent = user.endOfSub;
    document.querySelector("#inactiveSubs").textContent = isItSingle(user.inactiveSubs, "inactive subscription", "");
    if (!user.isConfirmed) {
        document.querySelector("#confirmed").textContent = "Is not yet confirmed";
    } else {
        document.querySelector("#confirmed").textContent = "";
    }
    if (user.connectedToFB) {
        document.querySelector("#connected").textContent = "Is connected to Facebook";
    } else {
        document.querySelector("#connected").textContent = "";
    }
    if (user.emailSubs === 0) {
        document.querySelector("#unsubAll").textContent = "Resub all";
    } else {
        document.querySelector("#unsubAll").textContent = "Unsub";
    }

    let backColor;
    let fontColor;
    if (user.kindOfSub === "blendle") {
        backColor = "rgb(70,70,70)";
        fontColor = "white";
    } else if (user.kindOfSub === "stripe") {
        backColor = "mediumslateblue";
        fontColor = "white";
    } else if (user.kindOfSub === "apple") {
        backColor = "dodgerblue";
        fontColor = "white";
    } else if (user.kindOfSub === "vodafone") {
        backColor = "brown";
        fontColor = "white";
    } else {
        backColor = "none";
        fontColor = "black";
    }
    if (user.trial === false) {
        document.querySelector("#endOfSub").style.background = backColor;
        document.querySelector("#endOfSub").style.border = "none";
        document.querySelector("#endOfSub").style.color = fontColor;
    } else {
        document.querySelector("#endOfSub").style.background = "none";
        document.querySelector("#endOfSub").style.border = "2px solid " + backColor;
        document.querySelector("#endOfSub").style.color = "black";
    }
    checkIfZero();
    unsubAll(user.userID)
    goToSupportal(user.userID);
}


// Update tabs
chrome.storage.local.get(['lastUsers'], function(userList) {
    let users = userList['lastUsers'];
    console.log(userList);
    // Create a list with all display names
    let displayNames = [];
    for (let u = 0; u < users.length; u++) {
        if (users[u]['userID'] !== undefined) {
            displayNames.push(users[u]['userID']);
        } else {
            displayNames.push("");
        }
    }
    updatePopup(users[0], 1);
    for (let i = 0; i < displayNames.length; i++) {
        document.querySelector(".tab" + (i + 1)).innerHTML = `<i class="fas fa-${users[i]["icon"]}"></i>` + displayNames[i];
    }
});


// Change tab when clicked
document.addEventListener('DOMContentLoaded', function() {
    let elem = document.querySelector(".scrollMenu");
    elem.addEventListener('click', function(e) {
        let t = e.target;
        chrome.storage.local.get(['lastUsers'], function(userList, t) {
            let users = userList['lastUsers'];
            for (let u = 0; u < users.length; u++) {
                if (users[u]["userID"] === e.target.textContent) {
                    updatePopup(users[u], u + 1);
                }
            }
        });
    });
});


// Get the user ID and open the user in Supportal
let uID;
function goToSupportal(userID) {
    uID = userID;
    let elemSame = document.querySelector(".sameTab");
    let elemNew = document.querySelector(".newTab");
    elemSame.addEventListener('click', goToSamePage, true);
    elemNew.addEventListener('click', goToNewPage, true);
}


// Open the Supportal info in the same tab
function goToSamePage(e) {
    let newURL = "https://supportal2.blendle.io/user/" + uID;
    chrome.tabs.query({}, function(tabs) {
        let tabID = -1;
        // Find the last open Supportal tab
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i]["url"] === newURL) {
                chrome.tabs.update(tabs[i]["id"], {selected: true});
            } else if (tabs[i]["url"].startsWith("https://supportal2.blendle.io/")) {
                chrome.tabs.update(tabs[i]["id"], {url: newURL, selected: true});
                return;
            }
        }
    });
}


// open the Supportal info in a new tab
function goToNewPage(e) {
    let newURL = "https://supportal2.blendle.io/user/" + uID;
    chrome.tabs.create({ url: newURL });
}


// Unsubscribe from all newsletters
function unsubAll(userID) {
    let elem = document.querySelector("#unsubAll");
    let isClicked = false;
    chrome.tabs.query({}, function(tabs) {
        let isItTheSamePage = false;
        for (let i = 0; i < tabs.length; i++) {
            let supportalTab = tabs[i];
            let userURL1 = "https://supportal2.blendle.io/user/" + userID + "#"
            let userURL2 = "https://supportal2.blendle.io/user/" + userID
            if (supportalTab["url"] === userURL1 || supportalTab["url"] === userURL2) {
                isItTheSamePage = true;
                elem.addEventListener('click', function() {
                    if (isClicked === false) {
                        chrome.tabs.sendMessage(supportalTab["id"], {unsubAll: userURL1});
                        document.querySelector("#unsubAll").innerText = "loading...";
                        isClicked = true;
                    }
                });
            }
        }
        if (isItTheSamePage === false) {
            document.querySelector("#unsubAll").style.display = "none";
        }
    })
}


// Check which variables are zero and change them to a grey color
function checkIfZero() {
    let allNum = document.querySelectorAll(".num");
    for (let n = 0; n < allNum.length; n++) {
        if (allNum[n].innerText.startsWith("0")) {
            allNum[n].classList.add("isZero");
        } else {
            allNum[n].classList.remove("isZero");
        }
    }
}


// Check if the variable is single or plural
function isItSingle(value, str1, str2) {
    if (value !== 1) {
        return value + " " + str1 + "s " + str2;
    } else {
        return value + " " + str1 + " " + str2;
    }
}
