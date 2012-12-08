/**
 * @author Esa
 */
$(function () {
	// create some ground
	"use strict";
	
	    var root = this;

    var previousGame = root.Game;        

    var Game = {
        _framerate: 30,

        _last_tick: 0,

        _heartbeat_queue: [], 
        
        _$fpscounter: $('<div id="fpscounter">Loading...</div>'),
        
        _timer: undefined,
        
        _delta: 0, 
        
        _starttime: undefined,

        Start: function() {
            $('header').append(this._$fpscounter);
            Game._last_tick = new Date().getTime();
            Game._starttime = Game._last_tick;
            Game.Heartbeat();
            window.Game = Game;
        }, 
        
        Stop: function() {
        	clearTimeout(Game._timer);
        	console.log("Game stopped!")        	
        },

        Heartbeat: function () {
            var fpsdelay = 1000/Game._framerate;
            var new_tick = new Date().getTime();
            var delta = new_tick - Game._last_tick;
            Game._delta = delta;             

            Game._last_tick = new_tick;
            //this._$fpscounter.html('FPS: ' + 1000/delta );
            $.each(Game._heartbeat_queue, function (i, item) {
            		if (undefined !==item) {
            			item();            	 
            		};
            	});
            	            	

            if (delta<fpsdelay) { 
                delta = fpsdelay + (fpsdelay-delta);             	
            } else { 
            	delta = fpsdelay; 
            }

            Game._timer = setTimeout(function () { Game.Heartbeat(); }, delta); 
        },

        BuildScene: function (sceneobj) {
            // create object with start method 
            var scene = sceneobj;
            if (undefined === scene) {
               scene = { 
                    type: "empty",
                    htmlcontent: ""
                };
            }
            scene.Play = function () {
                $("#scenecontainer").removeClass('hide');
                var $scene = $("#scene");
                $scene.unbind('click');
            	scene.$container = $scene;
                scene.startTime = Game._last_tick;

                switch (scene.type) {                	
                    case "empty": {
                        $scene.html("<h1>Empty Scene</h1>")
                        break;
                    }
                    case "html": {
                        $scene.html(scene.htmlcontent);
                        if (undefined !== scene.containerstyle) {
                        	if (toString.call(scene.containerstyle) == '[object String]') {
                        		$scene.attr("style", scene.containerstyle);
                        	} else {
                        		$scene.css(scene.containerstyle);
                        	}    
                       	}
                       	if (undefined !== scene.containerclass) {
                       		$scene.removeClass()                       		
                       		$scene.addClass(scene.containerclass);
                       	}
                        break;
                    }                
                    default: {
                        console.log('error in scene.Play switch');
                        break;
                    }
                }
                if (undefined !== scene.Execute) {
                	scene.Execute(scene);                
                }
                
                return true;
            }

            scene.End = function () {
                scene.$container.html("");
                scene.$container.parent().addClass('hide');
                return true;
            }
            
            return scene; 
        },
        
        onHeartBeat: function(callback) {
        	Game._heartbeat_queue.push(callback);
        },
        
        checkBoxCollision: function(box1, box2) {
        	var out = {};
        	if (box1.x < box2.x + box2.width && box1.x+box1.width > box2.x) {
        		if (box1.y <= box2.y+box2.height && box1.y+box1.height > box2.y+box2.height) {
					out.y = box1.y; // y collision;
				}
				if (box2.y+box2.height > box1.y+box1.height  & box2.y < box1.y + box1.height) {
					out.y = box1.y + box1.height
				}
			}
			
			if (box2.y < box1.y && box2.y+box2.height >= box1.y) {
				if (box1.x <= box2.x+box2.width && box2.x >= box1.x-box2.width) {
					out.x = box1.x;
				}
				if (box2.x+box2.width <= box1.x + box1.width && box1.x+box1.width <= box2.x) {
					out.x = box2.x + box2.width;
				}			
			
			}
			
			return out;
        }
    }
	
	var Terrain = {};
	
	window.Terrain = Terrain;
	
	var createTerrain = function(name, data) {
		
		data['background-color'] = data.color;
		var $terrain = $('<div id="'+name+'"></div>')
		
		// common 
		
		//set
		$terrain.css(data);	
		window.Terrain[name] = $terrain;
		$('#main').append($terrain);
		return $terrain;
	};
	
	createTerrain('ground', 
	{
		'position': 'fixed',
		'margin-left': 'auto', 
		'margin-top': 'auto',
		width: '100%',
		height: '3em',
		color: 'brown',
		bottom: '0px'
	});
	
	createTerrain('obstacle',
	{
		'position' : 'absolute',
		'margin-left': 'auto', 
		'margin-top': 'auto',
		width: '2%',
		height: '5em',
		color: 'brown',
		left: '30%',
		bottom: '3em'
	});
	
	createTerrain('platform',
	{
		'position' : 'absolute',
		'margin-left': 'auto', 
		'margin-top': 'auto',
		width: '20%',
		height: '2em',
		color: 'green',
		left: '50%',
		bottom: '10em'
	});
	
	
	/*
	createTerrain({
		name: 'ground',
		width: '100%',
		height: '5%',
		color: 'brown',
	});
	*/
	
	var blockman = {
		
		falling: false,
		
		$container: undefined,
		
		velocityY: 0,
		velocityX: 0,
		
		Create: function() {
			var $blockman = $('<img src="images/blockman.png"/>');
			$blockman.css({
				position: 'fixed',
				width: '2em', 
				height: 'auto',
				top: '3em',
				left: '3em'
			}); 
			blockman.$container = $blockman;
			
			$('#main').append($blockman);
		}		
		
	};
	
	Game.blockman = blockman
	
	blockman.Create();
	
	Game._framerate = 30;
	
	Game.blockman.animating = false;
	
	//gravity
	Game.onHeartBeat(function() {
		var velocityX  = Game.blockman.velocityX;
		var velocityY  = Game.blockman.velocityY;
		var collisionX = Game.blockman.collisionX;
		var collisionY = Game.blockman.collisionY;
					
		var bw = Game.blockman.$container.width();
		var bh = Game.blockman.$container.height();
		
		var ox = Game.blockman.$container.offset().left;
		var oy = Game.blockman.$container.offset().top;	
		/*if (oy<=0) {
			Game.blockman.velocityY = 0;
		}*/
			
		var terrainY = 2000;	
		var terrainX = 2000
		// check for collision
		Game.blockman.falling = true;
		Game.blockman.collisionX = undefined;
		Game.blockman.collisionY = undefined;
		
		for(var i in Terrain) {
			var foo = function (terrain) {
				var tt = terrain.offset().top;
				var tl = terrain.offset().left;
				var th = terrain.height();
				var tw = terrain.width();
				var dx = 0,  dy=0;
				if (undefined !== Game.blockman.last_position) {
					var last_position = Game.blockman.last_position;
					dx = last_position.x - ox;
					dy = last_position.y - oy;
					console.log(last_position);
				}
				
				var coords = Game.checkBoxCollision(
					{x: tl, height: th, y: tt, width: tw}, 
					{x: ox, height: bh, y: oy, width: bw });
				if (undefined !== coords.y) {
					Game.blockman.collisionY = coords.y;	
				    if (coords.y < oy + bh) {
						//console.log(coords.y, oy)
						Game.blockman.falling =false;
						terrainY = tt
					}
					console.log('collisionY', coords.y, oy, dy, velocityY);
					
					if (Math.abs(dy > Math.abs(dx))) {
						Game.blockman.$container.animate({ 'top': last_position.y+velocityY + "em" }, 1);	
						velocityY =0;
					}
					Game.blockman.last_position = {x: ox, y: oy};
					return;
				}
				if (undefined !== coords.x) {
					Game.blockman.collisionX = coords.x;
					console.log('collisionX', coords.x, ox, ox+bw);
					if (Math.abs(dx > Math.abs(dy))) {
						Game.blockman.$container.animate({ 'left': last_position.x + "em" }, 1);	
						velocityY =0;
					}
					terrainX = tl;
					velocityX = 0;
					Game.blockman.last_position = {x: ox, y: oy};
					return;
				}
			}(Terrain[i]);
		}
		
		
		var animationObject = {};
		// if no bottom collision falla
			
		if (Game.blockman.falling) {
			Game.blockman.velocityY = Game.blockman.velocityY - 0.1;
		} else {
			if (0 > Game.blockman.velocityY) {
				Game.blockman.velocityY = 0;
			} 
		}

		
		var distance = Math.abs(Game.blockman.velocityY);
			
		if (Game.blockman.velocityY > 0) { // animate jumpinga
			
			animationObject = {'top': '-='+distance+'em'}
		} else if (Game.blockman.velocityY < 0) { //animate falling
			var by = oy + bh;
			var tt = terrainY;
			if (tt-by < distance) {
				distance = tt-by;
			} else if (tt-by < 0){a
				distance = 0;aa
			}	
			
			console.log(distance);
			animationObject = {'top': '+='+distance+'em'}
		}		
		
		delete(animationObject.left);
		
		if (Game.blockman.velocityX > 0) {
			animationObject['left'] = '+='+velocityX+'em';
		}  else if (Game.blockman.velocityX < 0) {
			animationObject['left'] = '-='+Math.abs(velocityX)+'em';			
		}
		
		
		
		if (!Game.blockman.animating) {
			if (collisionX == undefined || collisionY == undefined) {
				Game.blockman.animating = true;
				Game.blockman.$container.animate(animationObject, 2, function() {
					Game.blockman.animating = false;
				});
			} else {
				console.log("collisions: ", collisionX - ox, collisionY -oy);
				if (collisionY <= (oy) ) {
					animationObject['top'] = '-='+Math.abs(collisionY-(velocityY))+'em';			
					console.log('a');
				} else {
					animationObject['top'] = '+='+(collisionY - velocityY)+'em';
					console.log('b');					
				}
				Game.blockman.$container.animate(animationObject, 16, function() {
					Game.blockman.animating = false;
					Game.blockman.falling = false;
					Game.blockman.velocityY = 0;
				});
			}
		}
		Game.blockman.last_position = { x: Game.blockman.$container.offset().x, y: Game.blockman.$container.offset().y}
				
	});
	
	Input.BuildInput({Handlers: {
		'keydown': function (event) {
			console.log(event.keyCode);
			switch (event.keyCode) {
				
				case 87: {
					if (Game.blockman.velocityY == 0 && !Game.blockman.falling) {
						Game.blockman.velocityY = 2;
					}
					break;
				}
				case 83: {
					//Game.blockman.velocityY = -20;
					break;
				}
				
				case 65: {
					Game.blockman.velocityX = -1;
					break;ddaa
				}
				case 68: {
					Game.blockman.
					velocityX = 1;
					break;
				}
				default:
					console.log(event.keyCode)
					break;		
				
			}
			
		},
		'keyup': function (event) {
			switch (event.keyCode) {
				
				case 87: {
					Game.blockman.velocityY = 0;
					break;
				}
				case 83: {
					//Game.blockman.velocityY = 0;
					break;
				}
				
				case 65: {
					Game.blockman.velocityX = 0;
					break;
				}
				case 68: {
					Game.blockman.velocityX = 0;
					break;
				}
				default:
					console.log(event.keyCode)
					break;		
				
			}
			
		}
		
	}});
	
	Game.Start();
	
	
	
})
