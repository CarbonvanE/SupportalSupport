// Update the popup page
function updatePopup(user, tab) {
    // Change tab color
    for (let i = 1; i <= 7; i++) {
        document.querySelector(".tab" + i).classList.remove("tabSelected");
    }
    document.querySelector(".tab" + tab).classList.add("tabSelected");

    // Change user info that's being displayed
    document.querySelector("#name").textContent = user.name;
    document.querySelector("#saldo").textContent = user.saldo;
    document.querySelector("#userSince").textContent = "User since " + user.signUpDate;
    if (!user.isConfirmed) {
        document.querySelector("#confirmed").textContent = "Is not yet confirmed";
    };
    if (user.connectedToFB) {
        document.querySelector("#connected").textContent = "Is connected to Facebook";
    };
    document.querySelector("#articlesRead").textContent = isItSingle(user.reads, "article", "read");
    document.querySelector("#transactions").textContent = isItSingle(user.transactions, "transaction", "");
    document.querySelector("#emailSubs").textContent = isItSingle(user.emailSubs, "email subscription", "");
    document.querySelector("#activeSubs").textContent = isItSingle(user.activeSubs, "active subscription", "");
    document.querySelector("#endOfSub").textContent = user.endOfSub
    document.querySelector("#inactiveSubs").textContent = isItSingle(user.inactiveSubs, "inactive subscription", "");

    if (user.kindOfSub === "blendle") {
        document.querySelector("#endOfSub").style.background = "coral";
        document.querySelector("#endOfSub").style.color = "white";
    } else if (user.kindOfSub === "stripe") {
        document.querySelector("#endOfSub").style.background = "deepskyblue";
        document.querySelector("#endOfSub").style.color = "white";
    } else if (user.kindOfSub === "apple") {
        document.querySelector("#endOfSub").style.background = "dodgerblue";
        document.querySelector("#endOfSub").style.color = "white";
    } else if (user.kindOfSub === "vodafone") {
        document.querySelector("#endOfSub").style.background = "crimson";
        document.querySelector("#endOfSub").style.color = "white";
    } else {
        document.querySelector("#endOfSub").style.background = "none";
        document.querySelector("#endOfSub").style.color = "black";
    }
    checkIfZero();
};


// Update tabs
chrome.storage.local.get(['lastUsers'], function(userList) {
    let users = userList['lastUsers'];
    console.log(userList)
    // Create a list with all display names
    let displayNames = [];
    for (let u = 0; u < users.length; u++) {
        displayNames.push(users[u]['userID']);
    };
    updatePopup(users[0], 1);
    for (let i = 0; i < displayNames.length; i++) {
        document.querySelector(".tab" + (i + 1)).innerHTML = getIcon(users[i], "") + displayNames[i];
    };
    goToSupportal();
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
                    goToSupportal();
                };
            };
        });
    });
});


// Get the user ID and open the user in Supportal
let uID = "";
function goToSupportal() {
    uID = document.querySelector(".tabSelected").innerHTML.split("</i>")[1];
    let elemSame = document.querySelector(".sameTab");
    let elemNew = document.querySelector(".newTab");
    elemSame.addEventListener('click', goToSamePage, true);
    elemNew.addEventListener('click', goToNewPage, true);
};


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
            };
        };
    });
};


// open the Supportal info in a new tab
function goToNewPage(e) {
    let newURL = "https://supportal2.blendle.io/user/" + uID;
    chrome.tabs.create({ url: newURL });
};


// Get the appropriate icon for each user
function getIcon(user, size) {
    if (user.reads > 500) {
        return `<i class="fas fa-user-astronaut ${size}"></i>`;
    } else if (user.reads < 5) {
        return `<i class="fas fa-child ${size}"></i>`;
    } else if (user.activeSubs > 0 && user.inactiveSubs > 0) {
        return `<i class="fas fa-user-shield ${size}"></i>`;
    } else if (user.activeSubs === 0 && user.inactiveSubs > 1) {
        return `<i class="fas fa-user-times ${size}"></i>`;
    } else if (user.activeSubs === 0 && user.inactiveSubs === 1) {
        return `<i class="fas fa-user-minus ${size}"></i>`;
    } else if (user.activeSubs > 0 && user.inactiveSubs === 0) {
        return `<i class="fas fa-user-clock ${size}"></i>`;
    } else if (user.transactions > 0) {
        return `<i class="fas fa-user-plus ${size}"></i>`;
    } else {
        return `<i class="far fa-question-circle ${size}"></i>`;
    };
};


// Check which variables are zero and change them to a grey color
function checkIfZero() {
    let allNum = document.querySelectorAll(".num");
    for (let n = 0; n < allNum.length; n++) {
        if (allNum[n].innerText.startsWith("0")) {
            allNum[n].classList.add("isZero");
        } else {
            allNum[n].classList.remove("isZero");
        };
    };
};


// Check if the variable is single or plural
function isItSingle(value, str1, str2) {
    if (value !== 1) {
        return value + " " + str1 + "s " + str2;
    } else {
        return value + " " + str1 + " " + str2;
    };
};
