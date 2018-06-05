var allInfo = {
    userID: "",
    uuid: "",
    name: "",
    saldo: "",
    email: "",
    isConfirmed: false,
    country: "",
    signUpDate: " a while ago?",
    reads: "",
    transactions: 0,
    connectedToFB: "",
    emailSubs: "",
    activeSubs: "",
    inactiveSubs: ""
};


// Begin of program
let allLines = getWebpage();
if (allInfo["userID"] !== false) {
    analyseWebpage(allLines);
    getStorage();
    chrome.runtime.sendMessage({"gotContent": true});
};


// Get text of webpage and check if its a user pages
function getWebpage() {
    let results = document.body.innerText;
    let allLines = results.split('\n');
    if (allLines[2] === "Results") {
        allInfo.userID = false;
        return;
    } else if (allLines[allLines.length - 1] === "Create user") {
        allInfo.userID = false;
        return;
    } else {
        return(allLines);
    };
};


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
            };
        } else if (line.startsWith("Email") && allInfo.email === "") {
            let emailAndBool = line.split('\t')[1];
            allInfo.email = emailAndBool.split(' ')[0];
            if (emailAndBool.split(' ')[1] === "Confirmed") {
                allInfo.isConfirmed = true;
            }
        } else if (line.startsWith("Country") && allInfo.country === "") {
            allInfo.country = line.split('\t')[1];
        } else if (line.startsWith("Facebook") && allInfo.connectedToFB === "") {
            let fb = line.split('\t')[1];
            if (fb != "-") {
                allInfo.connectedToFB = true;
            } else {
                allInfo.connectedToFB = false;
            };
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
        };
    };
};


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
                };
            };
            users.pop();
            users.unshift(allInfo);
            toStorage(users);
        };
    });
};


// Initializes storage,
function initializeStorage(num) {
    let storageList = [];
    for (let i = 0; i < num; i++) {
        storageList.push("");
    };
    chrome.storage.local.set({"lastUsers": storageList});
};


// Stores list in storage
function toStorage(users) {
    chrome.storage.local.set({"lastUsers": users});
};


// Finds the number of email subscriptions
function getEmailSubs() {
    let allSubs = document.querySelectorAll(".change-opt-out");
    let numOfSubs = 0;
    for (let i = 0; i < allSubs.length; i++) {
        if (allSubs[i].checked) {
            numOfSubs++;
        };
    };
    // let doNotChange = ["master_opt_out",
    //                     "ad_retargeting_opt_out",
    //                     "publisher_hashed_email_share_opt_out",
    //                     "mixpanel_opt_out"];
    // for (let i = 0; i < allSubs.length; i++) {
    //     console.log(allSubs[i]["name"])
    //     let inDoNotChange = false;
    //     for (let j = 0; j < doNotChange.length; j++) {
    //         if (allSubs[i]["name"] === doNotChange[j]) {
    //             inDoNotChange = true;
    //         }
    //     }
    //     if (inDoNotChange === false) {
    //         allSubs[i]["checked"] = false;
    //     }
    // }
    return(numOfSubs);
};
