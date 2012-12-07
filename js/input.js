//
// if not loaded jquery, just run the thing
// 
try {
    $;
} catch (ReferenceError){
    window.$ = function(fn){
        this.ready = function(fn){
            fn();
        };
        return this;
    };
}



/**
 * @author Esa
 */

$(function() {
	var Input = {
		_keybuffer: [],
		
		Handlers: {},
		
		_mouse: {},
	
		BuildInput: function (data) {
			if (undefined != data) {
				for(var i in data) {
					Input[i] = data[i]; //overwrite defaults
				}
			}
			
			//initialize KeyBuffer helper
			Input.KeyBuffer();
			
			$(window).unbind('keypress');
			$(window).keypress(function(event) {
				Input._keybuffer.push(event.keyCode);			
				console.log(String.fromCharCode(event.keyCode));
				if (event.keyCode === 13) {
					console.log (Input.KeyBuffer.toString());
				}
				if ('keypress' in Input.Handlers) {
					Input.Handlers.keypress(event);
				}
			});
			
			$(window).unbind('mousemove');
			$(window).mousemove(function(event) {
				Input._mouse.X  = event.pageX;
				Input._mouse.Y  = event.pageY;
				Input._mouse.Target = event.Target;
			})
			
			for(var i in Input.Handlers) {
				if ('keypress' !== i) {
					$('window').unbind('i');
					console.log(i);
					$(window).bind(i, Input.Handlers[i]);
				}
				
			}
			
			return Input;
		},
		
		KeyBuffer: function () {
			Input.KeyBuffer.toString = function () {
				var out = "";
				for(var i in Input._keybuffer) {
					out += String.fromCharCode(Input._keybuffer[i]);
				}
				return out;
			}
			return Input._keybuffer 
			},
		
	}

	
    if (window && !window.Input) {
        console.log('window::', window);
        window.Input = Input.BuildInput();
    }
});




function OLD_Input() {
	/**
	 * copypasta from tetris
	 */

	//

	var selected, seme, game_running, IE, command;
	
	self = Input;
	self.selected = "war1";
	seme = "";

	game_running = true;
	IE = document.all ? true : false;	
	mouse = "";


	self.select = function () {
		window.input.selected = this;
       	self.selected = this;
		console.log('imma selecting', this, window.Input);
		self.onselect();
		return this.id;
	};

	self.setCommand = function (cmd) {
		self.command = cmd;
	};

	/** Keydown
	 * reaction to user input here...
	 * TODO: messaging
	 */ 
	self.keydown = function (e) {
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
            default:
                break;
		}
	};

	/** Keyup
	 * reaction to user input here...
	 *
	 */
	self.game_running = true;
	self.keyup = function (e) {
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
            default: 
                break;
		}
	};

	self.initKeys = function () {
		if (document.addEventListener) { //IE?
			document.addEventListener("keydown", self.keydown, false);
			//   document.addEventListener("keypress",keypress,false);
			document.addEventListener("keyup", self.keyup, false);
			//   document.addEventListener("textinput",textinput,false);
		} else if (document.attachEvent) { //Gecko?
			document.attachEvent("onkeydown", self.keydown);
			//  document.attachEvent("onkeypress", keypress);
			document.attachEvent("onkeyup", self.keyup);
			//  document.attachEvent("ontextinput", textinput);
		} else {
			document.onkeydown = self.keydown;
			// document.onkeypress= keypress;
			document.onkeyup = self.keyup;
			// document.ontextinput= textinput;
		}
	};

	self.initMouse = function () {
		// If NS -- that is, !IE -- then set up for mouse capture
		if (!IE) { document.captureEvents(Event.MOUSEMOVE); }
		//
		// // Set-up to use getMouseXY function onMouseMove
		document.onmousemove = self.getMouseXY;
		document.onmousedown = self.getMouseDown;

	};

	self.getMouseXY = function (ev) {
		mouse = ev;
		if (IE) { // grab the x-y pos.s if browser is IE
			mouse.X = event.clientX + document.body.scrollLeft;
			mouse.Y = event.clientY + document.body.scrollTop;		
		} else {  // grab the x-y pos.s if browser is NS
			mouse.X = ev.pageX;
			mouse.Y = ev.pageY;

		}	

	};

	/**Mousedown **/
	self.getMouseDown = function (ev){
		mouse = ev;
		var Input = window.input;
		console.log(ev);
		console.log(self.command);
		if (ev.which===1 && this.command !== null) {
			//setTimeout(Input.command,0);
			console.log('command: ', this.command);
			this.command();
			this.command=null;
			//debug.write(Input.command);
		} 
		//if (ev.which===2) {
		//};
	};

	return self;
	/*function isdefined(variable) {
	  return (typeof (window[variable]) === "undefined") ?  false : true;

	  }*/
}

