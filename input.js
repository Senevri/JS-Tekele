/**
 * copypasta from tetris
 */

//

/** Keydown
 * reaction to user input here...
 *
 */
function keydown(e){
/*    if(game_running==false){
	return;
    }*/
    //document.writeln("DEBUG keyup<br>");
    var code;
    //if (!e) {var e = window.event;}
    if (e.keyCode) {code = e.keyCode;}
    else if (e.which) {code = e.which;}

    switch(code){ //works
    case 37://left
	    move("hob2", -5, 0);
	break;
    case 38://up
	    move("hob2", 0, -5);
	break;
    case 39://right
	    move("hob2", 5, 0);
	break;
    case 40://down
	    move("hob2", 0, 5);
	break;
    }
}

/** Keyup
 * reaction to user input here...
 *
 */
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


