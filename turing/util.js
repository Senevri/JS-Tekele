//util = (function(){
function hexify(int, pad) {
    if (int == null) return null
    return int.toString(16).toUpperCase().padStart(pad, "0")
}

let disable_printing = false

function print(str, element_id) {
    if (disable_printing) return
    if (!element_id) element_id = "content"
    document.getElementById(element_id).innerText += str
}

function println(str, element_id) {
    if (disable_printing) return
    if (!element_id) element_id = "content"
    document.getElementById(element_id).innerText += str + "\n"
}

function clear(element_id) {
    if (!element_id) element_id = "content"
    document.getElementById(element_id).innerText = ""
}

// return {
//     hexify: hexify,
//     print: print,
//     println: println
// }

//})()
export {
    hexify, print, println, clear
}
