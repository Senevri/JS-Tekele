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
		height: '5%',
		color: 'brown',
		bottom: '0px'
	});
	
	createTerrain('obstacle',
	{
		'position' : 'absolute',
		'margin-left': 'auto', 
		'margin-top': 'auto',
		width: '2%',
		height: '10%',
		color: 'brown',
		left: '50%',
		bottom: '5%'
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
				'max-width': '1%',
				width: '1%', 
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
	
	//gravity
	Game.onHeartBeat(function() {
		var velocityX  = Game.blockman.velocityX;			
		var bw = Game.blockman.$container.width();
		var bh = Game.blockman.$container.height();
		
		var ox = Game.blockman.$container.offset().left;
		var oy = Game.blockman.$container.offset().top;	
		/*if (oy<=0) {
			Game.blockman.velocityY = 0;
		}*/
			
		var terrainY = 2000;	
		// check for collision
		Game.blockman.falling = true;
		for(var i in Terrain) {
			var foo = function (terrain) {
				var tt = terrain.offset().top;
				var tl = terrain.offset().left;
				var th = terrain.height();
				var tw = terrain.width();
				if (tl < ox+bw && tl+tw > ox && tt <= oy + bh ) {
					Game.blockman.falling =false;
					terrainY = tt	
				} 	
			}(Terrain[i]);
		}
		
		
		
		// if no bottom collision falla
		if (Game.blockman.falling) {
			Game.blockman.velocityY = Game.blockman.velocityY - 1;
		}

		if (Game.blockman.velocityY > 0) { // animate jumping
			Game.blockman.$container.animate({'top': '-='+Game.blockman.velocityY+'px'}, 1, function() {
			});
		} else { //animate falling
			var distance = Math.abs(Game.blockman.velocityY);
			var by = oy + bh;
			var tt = terrainY;
			if (tt-by < 50 ) {
				distance = tt-by;
			}						
			
			Game.blockman.$container.animate({'top': '+='+distance+'px'}, 12);
		}
		
		if (terrainY <= oy+bh  && Game.blockman.velocityY < 0) {
			Game.blockman.velocityY = 0;
		}
		Game.blockman.falling = false;
		
		//if not r/l collision can move		
		
		if (Game.blockman.velocityX > 0) {
			Game.blockman.$container.animate({'left': '+='+velocityX+'px'}, 1, function() { });
		}  else if (Game.blockman.velocityX < 0) {
			Game.blockman.$container.animate({'left': '-='+Math.abs(velocityX)+'px'}, 1, function() {});
		}
		
	});
	
	Input.BuildInput({Handlers: {
		'keydown': function (event) {
			console.log(event.keyCode);
			switch (event.keyCode) {
				
				case 87: {
					if (Game.blockman.velocityY == 0) {
						Game.blockman.velocityY = 20;
					}
					break;
				}
				case 65: {
					Game.blockman.velocityX = -20;
					break;ddaa
				}
				case 68: {
					Game.blockman.velocityX = 20;
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
