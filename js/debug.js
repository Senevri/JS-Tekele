function debugWrite(message) {
	if (this.debugflag === true) {
		var e = document.getElementById("debug");
		e.innerHTML = e.innerHTML + message + "<br/>";
	} else if (this.debugflag === false) {
			//document.getElementById("debug").innerHTML = debugflag;
			//he does nothing
	}
}

function debugClear() {
	document.getElementById("debug").innerHTML = "";
}
function debug() {
	this.debugflag = true;
	this.write = debugWrite;
	this.clear = debugClear;
}

