window.onload = setInterval(function () {
    let all = document.querySelectorAll("a[href]");
    for (let index = 0; index < all.length; index++) {
        if (all[index]['href'].startsWith("mailto:") === true) {
            let elem = all[index],
                mail = elem['href'].substring(7);

            elem.removeAttribute("href");
            elem.setAttribute("style", "color: firebrick")
            elem.classList.add("thisEmail");
            elem.addEventListener('click', function() {
                chrome.runtime.sendMessage({"contents": "Load Supportal", "mail": mail});
            })
        }
    }
},1000);
