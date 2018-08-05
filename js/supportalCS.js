let allInfo = {
    isUser: "",
    userID: "",
    uuid: "",
    name: "",
    saldo: "",
    email: "",
    isConfirmed: false,
    productState: "",
    country: "",
    signUpDate: " a while ago?",
    reads: "",
    transactions: 0,
    connectedToFB: "",
    emailSubs: "",
    activeSubs: "",
    kindOfSub: "",
    endOfSub: "",
    inactiveSubs: "",
    trial: false,
    icon: ""
};


// Begin of program
let allLines = getWebpage();
if (allInfo["isUser"] === true) {
    analyseWebpage(allLines);
    goToStripe();
    getStorage();
    setIcon();
    unsubAll();
    chrome.runtime.sendMessage({"contents": "Found user", "info": allInfo});
} else {
    chrome.runtime.sendMessage({"contents": "Could not find the user!"});
}



// Get text of webpage and check if its a user pages
function getWebpage() {
    let results = document.body.innerText;
    let allLines = results.split('\n');
    if (allLines[3].startsWith("Could not find a user")) {
        allInfo.isUser = false;
    } else if (allLines[2] === "Results") {
        allInfo.isUser = allLines.slice(3);
        return;
    } else if (allLines[allLines.length - 1] === "Create user") {
        allInfo.isUser = false;
        return;
    } else {
        allInfo.isUser = true;
        return(allLines);
    }
}


// Analyse the webpage
function analyseWebpage(allLines) {
    // Strip first lines
    console.log(allLines);
    for (let i = 0; i < 10; i++) {
        if (allLines[0] == "Actions ") {
            allLines.shift();
            break;
        } else {
            allLines.shift();
        };
    };
    // Get saldo
    if (allLines[0].indexOf(' € ') > -1) {
        allInfo.saldo = "€" + allLines[0].split(' € ')[1].split(' ')[0];
    } else if (allLines[0].indexOf(' $ ') > -1) {
        allInfo.saldo = "$" + allLines[0].split(' $ ')[1].split(' ')[0];
    } else {
        allInfo.saldo = "NO SALDO FOUND!";
    }
    // Get number of email subscriptions
    allInfo["emailSubs"] = getEmailSubs();

    // Loop over all lines
    for (l = 1; l < allLines.length; l++) {
        let line = allLines[l];
        // Check for all other variables
        if (line.startsWith("User ID") && allInfo.userID === "") {
            allInfo.userID = line.split('\t')[1];
        } else if (line.startsWith("UUID") && allInfo.uuid === "") {
            allInfo.uuid = line.split('\t')[1];
        } else if (line.startsWith("Name") && allInfo.name === "") {
            let newName = line.split('\t')[1];
            if (newName !== "") {
                allInfo.name = newName;
            } else {
                allInfo.name = "N.A.";
            }
        } else if (line.startsWith("Email") && allInfo.email === "") {
            let emailAndBool = line.split('\t')[1];
            allInfo.email = emailAndBool.split(' ')[0];
            if (emailAndBool.split(' ')[1] === "Confirmed") {
                allInfo.isConfirmed = true;
            }
        } else if (line.startsWith("Product")) {
            let productState = line.split('\t')[1];
            productState = productState.substring(0, productState.length - 6)
            allInfo.productState = productState;
        } else if (line.startsWith("Country") && allInfo.country === "") {
            allInfo.country = line.split('\t')[1];
        } else if (line.startsWith("Facebook") && allInfo.connectedToFB === "") {
            let fb = line.split('\t')[1];
            if (fb != "-") {
                allInfo.connectedToFB = true;
            } else {
                allInfo.connectedToFB = false;
            }
        } else if (line.startsWith("Reads") && allInfo.reads === "") {
            allInfo.reads = line.split('\t')[1];
        } else if (line.startsWith("signup-gift") || line.startsWith("gift")) {
            allInfo.signUpDate = allLines[l - 1].split(', ')[0];
        } else if (line.startsWith("adyen-recur") || line.startsWith("adyen-deposit")) {
            allInfo.transactions++;
        } else if (line === "Subscriptions") {
            let splittedLine = allLines[l + 1].split(' ');
            allInfo.activeSubs = parseInt(splittedLine[0]);
            allInfo.inactiveSubs = parseInt(splittedLine[2]);
        } else if (line.startsWith("Type\tStart")) {
            if (allLines[l + 1] !== "Email settings") {
                let subList = allLines[l + 1].split(/\t| |, /);
                allInfo.kindOfSub = subList[1];
                let allTrials = ["blendlepremium_one_week_auto_renewal", "blendlepremium_one_week_apple", "blendlepremium_vodafone_3_months"]
                if (allTrials.includes(subList[0])) {
                    allInfo.trial = true;
                }
                if (subList[2] === "Trial") {
                    allInfo.trial = true;
                    allInfo.endOfSub = getDate(subList[5]);
                } else {
                    allInfo.endOfSub = getDate(subList[4]);
                }
            }
        }
    }
}


// Get the current storage and add the new user info
function getStorage() {
    chrome.storage.local.get(['lastUsers'], function(userList) {
        let users = userList['lastUsers'];
        // Check if a list has been stored
        if (users === undefined) {
            initializeStorage(7);
            getStorage();
            return;
        } else {
            for (let u = 0; u < users.length; u++) {
                // Check if the user is already in the storage
                if (users[u]['uuid'] === allInfo['uuid']) {
                    users.splice(u, 1);
                    users.unshift(allInfo);
                    toStorage(users);
                    return;
                }
            }
            users.pop();
            users.unshift(allInfo);
            toStorage(users);
        }
    })
}


// Initializes storage,
function initializeStorage(num) {
    let storageList = [];
    for (let i = 0; i < num; i++) {
        storageList.push("");
    }
    chrome.storage.local.set({"lastUsers": storageList});
}


// Stores list in storage
function toStorage(users) {
    chrome.storage.local.set({"lastUsers": users});
}


// Unsubscribe from all emails
function unsubAll() {
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        let currentPage = location.href
        if (currentPage === request.unsubAll || currentPage === request.unsubAll.substring(0, request.unsubAll.length - 1)) {
            let allSubs = document.querySelectorAll(".change-opt-out");
            for (let s = 0; s < allSubs.length; s++) {
                if (allSubs[s]["name"] === "master_opt_out") {
                    allSubs[s].click();
                    window.location.reload();
                    return;
                }
            }
        }
    })
}


// Find the number of email subscriptions
function getEmailSubs() {
    let allSubs = document.querySelectorAll(".change-opt-out");
    let numOfSubs = 0;
    for (let i = 0; i < allSubs.length; i++) {
        if (allSubs[i]["name"] !== "master_opt_out" && allSubs[i]["name"] !== "ad_retargeting_opt_out" && allSubs[i]["name"] !== "publisher_hashed_email_share_opt_out" && allSubs[i]["name"] !== "mixpanel_opt_out") {
            if (allSubs[i].checked) {
                numOfSubs++;
            }
        }
    }
    return(numOfSubs);
}


// Return the date in a simplified and more beautiful way
function getDate(date) {
    if (date.length != 10) {
        return date;
    } else {
        let day = date.substring(0,2);
        if (day[0] === "0") {
            day = day[1];
        };
        let month = date.substring(3,5);
        let year = date.substring(6,10);

        if (Number(year) === (new Date()).getFullYear()) {
            year = "";
        } else {
            year = "'" + year.substring(2,4);
        }
        allMonths = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sep", "Oct", "Nov", "Dec"];
        return day + " " + allMonths[Number(month) - 1] + " " + year;
    }
}


function setIcon() {
    if (allInfo.productState === "premium_only") {
        allInfo["icon"] = "user"
    } else if (allInfo.productState === "micropayments") {
            allInfo["icon"] = "user-tag"
    } else if (allInfo.productState === "premium_and_micropayments") {
            allInfo["icon"] = "user-astronaut"
    } else if (allInfo.productState === "upsell_only") {
            allInfo["icon"] = "user-slash"
    }
}

function goToStripe() {
    if (allInfo.kindOfSub === "stripe") {
        chrome.runtime.sendMessage({"contents": "Load Stripe", "mail": allInfo.email});
    }
}
