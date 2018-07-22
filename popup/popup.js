// Update the popup page
function updatePopup(user, tab) {
    // Change tab color
    for (let i = 1; i <= 7; i++) {
        $(".tab" + i).removeClass("tabSelected");
    }
    $(".tab" + tab).addClass("tabSelected");
    $("#unsubAll").css("display", "block");

    // Change user info that's being displayed
    $("#name").html(user.name);
    $("#saldo").html(user.saldo);
    $("#userSince").html("User since " + user.signUpDate);
    $("#articlesRead").html(isItSingle(user.reads, "article", "read"));
    $("#transactions").html(isItSingle(user.transactions, "transaction", ""));
    $("#emailSubs").html(isItSingle(user.emailSubs, "email subscription", ""));
    $("#activeSubs").html(isItSingle(user.activeSubs, "active subscription", ""));
    $("#endOfSub").html(user.endOfSub);
    $("#inactiveSubs").html(isItSingle(user.inactiveSubs, "inactive subscription", ""));
    !user.isConfirmed ? $("#confirmed").html("Is not yet confirmed") : $("#confirmed").html("");
    user.connectedToFB ? $("#connected").html("Is connected to Facebook") : $("#connected").html("");
    if (user.emailSubs === 0) {
        $("#unsubAll").html("Resub all");
    } else {
        $("#unsubAll").html("Unsub");
    }

    // Change the appearance of the "end of subscription" button
    let endOfSub = $("#endOfSub");
    endOfSub.removeClass();
    if (["blendle", "stripe", "vodafone", "apple"].includes(user.kindOfSub)) {
        endOfSub.addClass(user.kindOfSub.toLowerCase());
    } else {
        endOfSub.addClass("otherProvider")
    }
    user.trial ? endOfSub.addClass("trialPeriod") : console.log('Not a trial period');

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
        $(".tab" + (i + 1)).html(`<i class="fas fa-${users[i]["icon"]}"></i>` + displayNames[i]);
    }
});


// Change tab when clicked
$(document).ready(function() {
    let elem = $(".scrollMenu");
    elem.on('click', function(e) {
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
    let elemSame = $(".sameTab");
    let elemNew = $(".newTab");
    elemSame.on('click', goToSamePage);
    elemNew.on('click', goToNewPage);
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
    let elem = $("#unsubAll");
    let isClicked = false;
    chrome.tabs.query({}, function(tabs) {
        let isItTheSamePage = false;
        for (let i = 0; i < tabs.length; i++) {
            let supportalTab = tabs[i];
            let userURL1 = "https://supportal2.blendle.io/user/" + userID + "#"
            let userURL2 = "https://supportal2.blendle.io/user/" + userID
            if (supportalTab["url"] === userURL1 || supportalTab["url"] === userURL2) {
                isItTheSamePage = true;
                elem.on('click', function() {
                    if (isClicked === false) {
                        chrome.tabs.sendMessage(supportalTab["id"], {unsubAll: userURL1});
                        $("#unsubAll").html("loading...");
                        isClicked = true;
                    }
                });
            }
        }
        if (isItTheSamePage === false) {
            $("#unsubAll").css("display", "none");
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
