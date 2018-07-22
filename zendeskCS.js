window.onload = setInterval(function () {
    let all = document.querySelectorAll("a[href]");
    let elems = [];
    for (let index = 0; index < all.length; index++) {
        // console.log(all[index]);
        // console.log(all[index]["href"]);
        if (all[index]['href'].startsWith("mailto:") === true) {
            elems.push([all[index]['href'].substring(7), all[index]]);
            console.log([all[index]['href'].substring(7), all[index]])
        }
    }
    for (let index = 0; index < elems.length; index++) {
        let elem = elems[index][1],
            mail = elems[index][0];
        elem.removeAttribute("href");
        elem.setAttribute("style", "color: firebrick")
        elem.classList.add("thisEmail");
        // elem.onmouseover = function() {
        //     elem.setAttribute("style", "font-weight: bold")
        // }
        elem.addEventListener('click', function() {
            console.log(mail)
            chrome.runtime.sendMessage({"loadSupportal": true, "mail": mail});
        })
    }
},500);
