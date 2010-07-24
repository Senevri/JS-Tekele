function debugWrite(message){

	debugflag=true;

	if (debugflag==true){
			e = document.getElementById("debug");
			e.innerHTML = e.innerHTML + message + "<br/>";
		};

	if (debugflag==false){
			document.getElementById("debug").innerHTML = debugflag;
			//he does nothing
	};
}
function debugClear(){
			document.getElementById("debug").innerHTML = "";
}