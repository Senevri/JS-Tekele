function debugWrite(message){

	//debugflag=true;

	if (this.debugflag===true){
			e = document.getElementById("debug");
			e.innerHTML = e.innerHTML + message + "<br/>";
		}

	if (this.debugflag===false){
			//document.getElementById("debug").innerHTML = debugflag;
			//he does nothing
	}
}
function debugClear(){
			document.getElementById("debug").innerHTML = "";
}
function debug(){
	this.debugflag=true;
	this.write = debugWrite;
	this.clear = debugClear;
}

