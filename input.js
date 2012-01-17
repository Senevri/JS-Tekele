
var mouse;
$(document).ready(function() {
if (window && !window.input) {
	console.log('window::', window);
	window.input = new Input();
}

window.input.getInstance = function () {
	if(!window.input) {
		window.input = new Input();
	}
	return window.input;
}
console.log(window.input);
});

function Input() {
	/**
	 * copypasta from tetris
	 */

	//

	var selected, seme, game_running, IE;
	this.selected = "war1";
	seme = "";

	game_running = true;
	IE = document.all ? true : false;	
	mouse = "";


	this.select = function () {
		window.input.selected = this.id;
		console.log('imma selecting', this, window.input);
		this.onselect();
		return this.id;
	}

	this.setCommand = function (cmd) {
		this.command = cmd;
	}

	/** Keydown
	 * reaction to user input here...
	 * TODO: messaging
	 */ 
	this.keydown = function (e) {
		debugClear();
		debugWrite(selected);
		/*    if(game_running==false){
		      return;
		      }*/
		//document.writeln("DEBUG keyup<br>");
		var code, speed = 32;
		//if (!e) {var e = window.event;}
		if (e.keyCode) { code = e.keyCode; }
		else if (e.which) {code = e.which; }

		switch (code) { //works
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
	this.game_running = true;
	this.keyup = function (e) {
		if (game_running === false) {
			return;
		}
		//document.writeln("DEBUG keyup<br>");
		var code;
		if (!e) { e = window.event; }
		if (e.keyCode) {
			code = e.keyCode;
		} else if (e.which) {
			code = e.which;
		}

		/* Next line should be contingent on whether the block actually can move. */   
		/* Wait, does it actually matter? move returns same coords if no move? */
		switch (code) { //works
			case 40://down
				break;

		}
	}
	this.initKeys = function () {
		if (document.addEventListener) { //IE?
			document.addEventListener("keydown", this.keydown, false);
			//   document.addEventListener("keypress",keypress,false);
			document.addEventListener("keyup", this.keyup, false);
			//   document.addEventListener("textinput",textinput,false);
		} else if (document.attachEvent) { //Gecko?
			document.attachEvent("onkeydown", this.keydown);
			//  document.attachEvent("onkeypress", keypress);
			document.attachEvent("onkeyup", this.keyup);
			//  document.attachEvent("ontextinput", textinput);
		} else {
			document.onkeydown = this.keydown;
			// document.onkeypress= keypress;
			document.onkeyup = this.keyup;
			// document.ontextinput= textinput;
		}
	}

	this.initMouse = function () {
		// If NS -- that is, !IE -- then set up for mouse capture
		if (!IE) { document.captureEvents(Event.MOUSEMOVE); }
		//
		// // Set-up to use getMouseXY function onMouseMove
		document.onmousemove = this.getMouseXY;
		document.onmousedown = this.getMouseDown;

	}

	this.getMouseXY = function (ev) {
		mouse = ev;
		if (IE) { // grab the x-y pos.s if browser is IE
			mouse.X = event.clientX + document.body.scrollLeft;
			mouse.Y = event.clientY + document.body.scrollTop;		
		} else {  // grab the x-y pos.s if browser is NS
			mouse.X = ev.pageX;
			mouse.Y = ev.pageY;

		}	

	}
	/**Mousedown **/
	this.getMouseDown = function (ev){
		mouse = ev;
		var Input = window.input
		console.log(ev);
		console.log(window.input.command);
		if (ev.which===1 && window.input.command != null) {
			//setTimeout(Input.command,0);
			console.log('command: ', input.command);
			Input.command();
			Input.command=null;
			//debug.write(Input.command);
		} 
		//if (ev.which===2) {
		//};
	}

	/*function isdefined(variable) {
	  return (typeof (window[variable]) === "undefined") ?  false : true;

	  }*/
}

