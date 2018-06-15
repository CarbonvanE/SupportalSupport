chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    let textBox = document.querySelector('.fr-focus');
    let isPublic = textBox.classList.contains('is-public');
    if (isPublic === false) {
        alert("This reply was sent as an internal note, NOT as a public reply!");
    }
    let buttons = document.querySelector('.ticket_submit_buttons');
    let solvedButton = buttons.querySelector('.solved');
});

// 
// window.onload = function () {
//     setInterval(function() {
//         let textBox = document.querySelector('.fr-focus');
//         let isPublic = textBox.classList.contains('is-public');
//         let box = document.querySelector('.zendesk-editor--rich-text-comment');
//         if (isPublic === false) {
//             box.style.backgroundColor = "rgb(25, 25, 25)";
//             box.style.color = "white";
//         } else {
//             box.style.backgroundColor = "white";
//             box.style.color = "black";
//         }
//     }, 50)
// }
