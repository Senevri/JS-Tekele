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

    var get_ftype_string = function (entry) {
        return entry.substring(entry.length-3);
    }
/* preload resources */
	var resources = {gfx: {}, sfx: {}}
	var res_strings = [
		"test.png",
		"fanta_in_space.mp3"
	].forEach(function(entry){
            switch(get_ftype_string(entry)) {
			case "png":
				/* if image is loaded, complete=true*/
				resources.gfx[entry] = new Image();
				resources.gfx[entry].src = "../assets/".concat(entry);
                resources.gfx[entry].filename = entry.substring(0, entry.length-4);
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
	var motion = { x:0, y:0 };
	for (var key in resources.gfx) {
		console.log(key);
		if (resources.gfx.hasOwnProperty(key)) {
			//resources.gfx[key].clientLeft = x; // these two are read-only elements
			//resources.gfx[key].clientTop = y;
			resources.gfx[key].onload = function(foo){
				var self=resources.gfx[key];
                switch (self.name) {
                    default:
                }
                ctx.drawImage(self, self.clientLeft, self.clientTop, 128 , 128);
			}
			//x = ((x+128)>dom.canvas.width) ? 0: x + 128;
		}
	}

    document.addEventListener('keydown', function(event) {
		let keyhandlers = {
			"w": ()=>motion.y -= 100,
			"a": ()=>motion.x -= 100,
			"s": ()=>motion.y += 100,
			"d": ()=>motion.x += 100,
		}

		if (Object.keys(keyhandlers).includes(event.key)) {
			//console.log(event, keyhandlers[event.key])
			keyhandlers[event.key]()
		}
		else {

			console.log("no handler for", event.keyCode, event.key);
		}
    });

    var fps = 60

	class Entity{
		name="Unnamed"
		gfx=null
		position={x:0,y:0}
		constructor(name, gfx, position){
			this.name = name
			this.gfx = gfx
			this.position = position ? position : this // y dis works?
		}
	}

	var entities = [
		new Entity("Player", resources.gfx["test.png"]),
		new Entity("not_player", resources.gfx["test.png"], {x:100, y:100})
	]

	var heartbeat = window.setInterval(function (){
			/*start heartbeat*/
			dom.text.nodeValue= "Hellotime, seconds ".concat(foo*fps/1000);

            ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
			entities.forEach(entity=>{
				if (entity.name==="Player") {
					entity.position.x = motion.x
					entity.position.y = motion.y
				} else {
					//console.log(entity.position)
				}
				if (entity.gfx) {
					ctx.drawImage(
						entity.gfx,
						entity.gfx.clientLeft + entity.position.x, entity.gfx.clientTop + entity.position.y,
						100, 100);
				}
			})


			/*end heartbeat*/
			foo++;
	}, 1000/fps);
	//resources.sfx.test.volume = 0.5;
	//resources.sfx.test.play();
	//resources.sfx.test.currentTime=120;


	console.log(resources);
	console.log(entities)
})();
