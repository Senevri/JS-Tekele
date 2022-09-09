let inputbuffer = [">"]
function echo(str, element_id) {
    console.log(str == ' ')
    if (["Control", "Shift", "Alt", "Escape"].includes(str)) return
    if (str == "Enter") {
        str = "\n>"
    }

    if (str == "Backspace" && inputbuffer.length > 0) {
        inputbuffer.pop();
    } else {
        if (str == ' ') str = " "
        inputbuffer.push(str)
    }
    console.log(inputbuffer)

    let input = document.getElementById(element_id || "input")
    input.innerText = inputbuffer.join("")
    // input.focus()
    // input.value = inputbuffer.toString()
}

export { echo }
