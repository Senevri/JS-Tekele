(function(){
"use strict";

	window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

/* SETUP */
	var foo = 0;
	var dom = {};
	
	dom.text = document.createTextNode("Helloworkd");
	dom.canvas = document.createElement("canvas");	
	var p = document.createElement("P")
		.appendChild(dom.text)
	dom.main = document.getElementById("mainWindow");	  
	dom.main.appendChild(p);
	dom.main.appendChild(dom.canvas);
	dom.canvas.style.marginTop="8px";
	dom.canvas.style.border="4px solid black";
	dom.canvas.width=dom.main.offsetWidth;
	dom.canvas.height=480;
    var btn = document.createElement("button");
    btn.appendChild(document.createTextNode("Music"));
    dom.main.appendChild(btn);
	console.log(dom.canvas);
	/* relevant */
	var ctx = dom.canvas.getContext("2d");  
	ctx.fillStyle="#000000";
	ctx.imageSmoothingEnabled = true;

/* preload resources */
	var resources = {gfx: {}, sfx: {}}
	var res_strings = [
		"test.png",
		"fanta_in_space.mp3"
	].forEach(function(entry){
		switch(entry.substring(entry.length-3)) {
			case "png":
				/* if image is loaded, complete=true*/
				resources.gfx[entry] = new Image();
				resources.gfx[entry].src = "../assets/".concat(entry);
			break;
			case "mp3":
				resources.sfx[entry] = new Audio();
				resources.sfx[entry].src = "../assets/".concat(entry);
			break;
		}
	});

    btn.onclick = function() {
        var fanta = resources.sfx["fanta_in_space.mp3"];
        if (fanta.paused) {
            fanta.play();
        } else { 
            fanta.pause()
        };
        console.log(fanta);
    };
	
	console.log(resources);
	var x=0, y=0;
	for (var key in resources.gfx) {
		console.log(key);
		if (resources.gfx.hasOwnProperty(key)) {
			//resources.gfx[key].clientLeft = x; // these two are read-only elements
			//resources.gfx[key].clientTop = y;
			resources.gfx[key].onload = function(foo){
				var self=resources.gfx[key];
				ctx.drawImage(self, self.clientLeft, self.clientTop, 128 , 128);	  				
			}
			x = ((x+128)>dom.canvas.width) ? 0: x + 128;
		}
	}
		
	var heartbeat = window.setInterval(function (){
			/*start heartbeat*/
			dom.text.nodeValue= "Hellotime, seconds ".concat(foo);		
			/*end heartbeat*/				
			foo++;
	}, 1000);
	//resources.sfx.test.volume = 0.5;
	//resources.sfx.test.play();
	//resources.sfx.test.currentTime=120;
	
	
	console.log(resources);	  
})();
