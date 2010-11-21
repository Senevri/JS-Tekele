/**
 * copypasta from tetris
 */

//

selected = "hob2";
command = "default";
game_running=true;
var IE = document.all?true:false;	
var mouse="";


function select(){
	selected = this;
	this.onselect();
	return this.id;
}

/**Mousedown **/



/** Keydown
 * reaction to user input here...
 * TODO: messaging
 */ 
function keydown(e){
	debugClear();
	debugWrite(selected);
/*    if(game_running==false){
	return;
    }*/
    //document.writeln("DEBUG keyup<br>");
    var code;
	var speed=32;
    //if (!e) {var e = window.event;}
    if (e.keyCode) {code = e.keyCode;}
    else if (e.which) {code = e.which;}

    switch(code){ //works
    case 37://left
	    move(selected, -speed, 0);
	break;
    case 38://up
	    move(selected, 0, -speed);
	break;
    case 39://right
	    move(selected, speed, 0);
	break;
    case 40://down
	    move(selected, 0, speed);
	break;
    }
}

/** Keyup
 * reaction to user input here...
 *
 */
 game_running ===true;
function keyup(e){
    if(game_running===false){
	return;
    }
    //document.writeln("DEBUG keyup<br>");
    var code;
    if (!e) { var e = window.event; }
    if (e.keyCode) {
	    code = e.keyCode;
    } else if (e.which){
	    code = e.which;
    }

/* Next line should be contingent on whether the block actually can move. */   
/* Wait, does it actually matter? move returns same coords if no move? */
    switch(code){ //works
    case 40://down
	break;
	
    }
}
function initKeys() {
	if (document.addEventListener){ //IE?
		document.addEventListener("keydown",keydown,false);
		//   document.addEventListener("keypress",keypress,false);
		document.addEventListener("keyup",keyup,false);
		//   document.addEventListener("textinput",textinput,false);
	} else if (document.attachEvent) { //Gecko?
		document.attachEvent("onkeydown", keydown);
		//  document.attachEvent("onkeypress", keypress);
		document.attachEvent("onkeyup", keyup);
		//  document.attachEvent("ontextinput", textinput);
	} else {
		document.onkeydown=keydown;
		// document.onkeypress= keypress;
		document.onkeyup=keyup;
		// document.ontextinput= textinput;
	}

 }

function initMouse() {
	// If NS -- that is, !IE -- then set up for mouse capture
	if (!IE) document.captureEvents(Event.MOUSEMOVE)
	//
	// // Set-up to use getMouseXY function onMouseMove
	document.onmousemove = getMouseXY;

}

function getMouseXY(ev) {
	mouse = ev;
	if (IE) { // grab the x-y pos.s if browser is IE
		mouse.X = event.clientX + document.body.scrollLeft;
		mouse.Y = event.clientY + document.body.scrollTop;
	} else {  // grab the x-y pos.s if browser is NS
		mouse.X = ev.pageX;
		mouse.Y = ev.pageY;

	}
}

function isdefined( variable)
{
	    return (typeof(window[variable]) == "undefined")?  false: true;
}


