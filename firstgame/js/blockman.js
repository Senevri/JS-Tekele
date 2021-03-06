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
        
        
        checkBoxCollision: function(box2, box1) {       
        	//var out = { x: undefined, y: undefined};
        	var out = false;
        	// if left side of 1 is inside right side of 2 and left side of 2 is inside right side of 1.
        	if ((box1.x <= box2.x + box2.width && box1.x+box1.width >= box2.x) ||
        	 	(box2.x <= box1.x + box1.width && box2.x+box2.width >= box1.x)) {        		
        		if ((box1.y <= box2.y+box2.height && box1.y+box1.height >= box2.y) ||
        			(box2.y <= box1.y+box1.height && box2.y+box2.height >= box1.y)) {
        			out = true;					
				}				 
			}
			
			return out;
        }, 
        checkPointCollision: function(point, box) {
        	var out = false;
        	if (point.x >= box.x && point.x <= box.x+box.width) {
        		if (point.y >= box.y && point.y <= box.y + box.height) {
        			out = true;
        		}        		
        	}        	
        	return out;        	
        },
        
        checkHVCollisionLine: function(box1, box2) {
        	var out = { x: undefined, y: undefined};
        	var yaxiscenter = box1.x + (box1.width/2);
        	var xaxiscenter = box1.y + (box1.height/2);
        	if (xaxiscenter >= box2.y && xaxiscenter <= box2.y+box2.height ) {
        		out.x = xaxiscenter;
        	}                	
        	if (yaxiscenter >= box2.x && yaxiscenter <= box2.x+box2.width) {
        		out.x = yaxiscenter;
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
		height: '120px',
		color: 'brown',
		bottom: '20px'
	});
	
	createTerrain('obstacle',
	{
		'position' : 'absolute',
		'margin-left': 'auto', 
		'margin-top': 'auto',
		width: '50px',
		height: '100px',
		color: 'brown',
		left: '30%',
		bottom: '140px'
	});
	
	createTerrain('platform',
	{
		'position' : 'absolute',
		'margin-left': 'auto', 
		'margin-top': 'auto',
		width: '20%',
		height: '160px',
		color: 'green',
		left: '50%',
		bottom: '260px'
	});

	createTerrain('platform2',
	{
		'position' : 'absolute',
		'margin-left': 'auto', 
		'margin-top': 'auto',
		width: '50px',
		height: '100px',
		color: 'green',
		left: '20%',
		bottom: '500px'
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
		
		MaxVelocityY: 30,
		velocityY: 0,
		velocityX: 0,
		
		Create: function() {
			var $blockman = $('<img src="images/blockman.png"/>');
			$blockman.css({
				position: 'fixed',
				width: '40px', 
				height: 'auto',
				top: '60px',
				left: '60px'
			}); 
			blockman.$container = $blockman;
			
			$('#main').append($blockman);
		}		
		
	};
	
	Game.blockman = blockman
	
	blockman.Create();
	
	Game._framerate = 30;
	
	Game.blockman.animating = false;
	Game.$window = $(window);
	Game.blockman.last_position = { x: Game.blockman.$container.offset().x, y: Game.blockman.$container.offset().y}
	
	//gravity
	Game.onHeartBeat(function() {
		if (Game.blockman.animating) {
			//console.log('exceape');
			return;
		}
		var last_pos = Game.blockman.last_position;		
		var windowheight = Game.$window.height();
		var velocityX  = Game.blockman.velocityX;
		var velocityY  = Game.blockman.velocityY;
		var collisionX = false;
		var collisionY = false;
					
		var bw = Game.blockman.$container.width();
		var bh = Game.blockman.$container.height();
		
		var ox = Game.blockman.$container.offset().left;
		var oy = Game.blockman.$container.offset().top;	
		/*if (oy<=0) {
			Game.blockman.velocityY = 0;
		}*/			
			
		var terrainY = 2000;	
		var terrainX = 2000
		
		// terminal velocity: 
		if (velocityY < -4) { velocityY = -4};
		
		// check for collision
		Game.blockman.collisionX = undefined;
		Game.blockman.collisionY = undefined;
		var collision = false;
		Game.blockman.falling = true;
		
		if (Game.blockman.falling) {
			Game.blockman.velocityY = Game.blockman.velocityY - 2;
			velocityY = Game.blockman.velocityY;
		} 
				
		// check for no collision on our future position
		var $debug = $('#debug');
				
		for(var i in Terrain) {		
			var foo = function (terrain) {
				var tt = terrain.offset().top;
				var tl = terrain.offset().left;
				var th = terrain.height();
				var tw = terrain.width();
				
				var futurex = ox+velocityX;
				var futurey = oy+velocityY;
				var axiscoll = {x:undefined, y:undefined};
				Game.blockman.collisionX = undefined;
				Game.blockman.collisionY = undefined;
								
				var collision = Game.checkBoxCollision(
					{x: tl, height: th, y: tt, width: tw}, 
					{x: futurex, height: bh, y: futurey, width: bw });						

				if (collision) {				
					if (Game.checkPointCollision({x:(futurex + (bw/2)), y:(futurey+bh)}, {x:tl, height:th, y:tt, width:tw} )) {
						Game.blockman.collisionY = futurey + bh;							
					}
					else if (Game.checkPointCollision({x:(futurex + (bw/2)), y:(futurey)}, {x:tl, height:th, y:tt, width:tw} )) {
						Game.blockman.collisionY = futurey;							
					}
					if (undefined !== Game.blockman.collisionY) {					
						Game.blockman.velocityY = 0;		   		
					}			
				
					if (Game.checkPointCollision({x:(futurex), y:(futurey+bh/2)}, {x:tl, height:th, y:tt, width:tw} )) {
						Game.blockman.collisionX = futurex;							
					}
					else if (Game.checkPointCollision({x:(futurex + bw), y:(futurey+bh/2)}, {x:tl, height:th, y:tt, width:tw} )) {
						Game.blockman.collisionX = futurex+bw;							
					}
					if (undefined !=Game.blockman.CollisionX) {
						Game.blockman.velocityX = 0;				
					}	
				}
							
				return collision;
			}
			if (foo(Terrain[i])) {
				//return;
				break;
			}
			
		}
		
		
		var animationObject = {};
		// if no bottom collision falla
						
		var distance = Math.abs(Game.blockman.velocityY);
			
		if (Game.blockman.velocityY > 0) { // animate jumpinga
			
			animationObject = {'top': '-='+distance+'px'}
		} else if (Game.blockman.velocityY < 0) { //animate falling
			var by = oy + bh;
			var tt = terrainY;
			if (tt-by <= distance) {
				distance = tt-by;
			} else if (tt-by < 0){
				distance = 0;
			}	
			Game.blockman.falling = true;
			//console.log(distance);
			animationObject = {'top': '+='+distance+'px'}
		}		
				
		if (Game.blockman.velocityX > 0) {
			animationObject['left'] = '+='+velocityX+'px';
		}  else if (Game.blockman.velocityX < 0) {
			animationObject['left'] = '-='+Math.abs(velocityX)+'px';			
		}
				
		
		//console.log(last_pos)a
		if (collisionX) {			
			
			if (velocityX !== 0) {
				animationObject['left'] = Game.blockman.collisionX+'px';
				//Game.blockman.velocityX = 0;
			}
			if (collisionY && velocityY != 0) {
				//animationObject['left'] = Game.blockman.collisionX+'px';
				Game.blockman.velocityX = 0;
				velocityX = 0;
				//animationObject['top'] =  Game.blockman.collisionY+'px';			
				//Game.blockman.velocityY = 0;
												
			}				
		}
		else if (collisionY && velocityY !== 0) {			
			animationObject['top'] =  Game.blockman.collisionY+'px';
			Game.blockman.velocityY = 0;
			Game.blockman.falling = false;
		}
		
		/*if (collisionY && oy < Game.blockman.collisionY && !collisionX) {
			Game.blockman.falling = false;
			Game.blockman.velocityY = 0;
		}*/
		
		if (collisionX && collisionY && Game.blockman.falling) {
			console.log('gba');
			Game.blockman.falling = false;
			Game.blockman.velocityY = 0;			
			//animationObject['left'] = undefined;
			//animationObject['top'] =  undefined;
		} 
		
		if (!Game.blockman.animating) {
			Game.blockman.animating = true;
			Game.blockman.$container.animate(animationObject, 50,  function() {
				Game.blockman.animating = false;				
			});
			
		} 						
				
	});
	
	Input.BuildInput({Handlers: {
		'keydown': function (event) {
						
			var bw = Game.blockman.$container.width();
			var bh = Game.blockman.$container.height();
			
			var ox = Game.blockman.$container.offset().left;
			var oy = Game.blockman.$container.offset().top;
			
			var coords = {};
			var collision = false;
					
			
			switch (event.keyCode) {
				
				case 87: {
					if (Game.blockman.velocityY >= 0 && !Game.blockman.falling && Game.blockman.velocityY < Game.blockman.MaxVelocityY) {
						Game.blockman.velocityY += 30;
					}
					break;
				}
				case 83: {
					Game.blockman.velocityY = -20;
					break;
				}
				
				case 65: {
					Game.blockman.velocityX = -20;
					break;
				}
				case 68: {
					Game.blockman.velocityX = 20;
					break;
				}
				default:
					console.log(event.keyCode)
					break;					
			}
			
			var velocityX  = Game.blockman.velocityX;
			var velocityY  = Game.blockman.velocityY;
			
			//console.log("vx", velocityX, "vy", velocityY);
	
			
			/*for(var i in Terrain) {
				var terrain = Terrain[i];
				
				var tt = terrain.offset().top;
				var tl = terrain.offset().left;
				var th = terrain.height();
				var tw = terrain.width();
				
				var box1 = {x: tl, height: th, y: tt, width: tw};
				var box2 = {x: futurex, height: bh, y: futurey, width: bw };
				coords = Game.checkBoxCollision(
					box1, 
					box2);										
				if (coords.y !== undefined || coords.x !== undefined) {
					collision = true;
					break;
				}
			}
			
			console.log(futurex, futurey)
			console.log(box1, box2);
			if (coords.y != undefined) {
				console.log('ycoll');
				Game.blockman.velocityY = 0;
			}
			if (coords.x != undefined) {
				console.log('xcoll');
				Game.blockman.velocityX = 0;
			}
			console.log(coords);*/		
						
		},
		'keyup': function (event) {
			switch (event.keyCode) {
				
				case 87: {
					//Game.blockman.velocityY = 0;
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
