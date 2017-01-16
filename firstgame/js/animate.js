//var actor;
//var anim;
//var moving=false;
//var tx; 
//var ty;

function is_array(input) {
    return typeof (input) === 'object' && (input instanceof Array);
}

function Animation(id, fr, delay) {
    this.imgpath = "images/"
	if (this.animation === 'undefined') {
		this.animation = []
	}
	this.playing=0;
	this.id = id;
	this.tick = false;
	//this.frames;
	this.frames = fr;	
	this.delay = delay;
	this.curframe = 0;
	this.maxframe = this.frames.length - 1;
	this.refresh = function () {
		document.getElementById(this.id).innerHTML = this.content;
	};
	this.play = function () {
		var a = this;
		if (a.curframe < a.maxframe) {
			a.curframe++;
		} else {
			a.curframe = 0;
		}
		this.content = '<img src="' + a.imgpath + a.frames[a.curframe] + '" style="width:32px; height:32px;"/>';
		this.refresh();	
	};
	this.start = function(){
		this.playing = Animation_loop(this);
	}
	this.stop = function () {
		clearTimeout(this.playing);
	};
}

var dx = null;
var dy = null;

function Animation_loop(animation) {
	var tick, i = 0, a, container;
	//dx=0;
	a = animation
    	//if (0!= a.playing) clearTimeout(a.playing);
	a.play();
	a.playing = setTimeout(function (){
		Animation_loop(a);
	}, a.delay);		
}

function view_animation(frames, count) {
	var al, out, i, wframes, animview, cnt;
	out = "";
	if (0==count) { count = frames.length; }
	for (i = 0; i < count; i++) {
		out += '<img src="' + frames[i] + '" />';
	}
	
	wframes = new Widget('frames');
	wframes.wrap("p", 'style="font-family:Courier, Monotype"', "Frames:");
	wframes.add(out);
	animview = new Widget('animview');
	animview.wrap("p", 'style="font-family:Courier, Monotype;"', "Animation:");	
	animview.add('<div id="animview"></div>');	
	cnt = new Widget('container');
	cnt.add('<div style="position:absolute; float:left; left:0px; margin: 10px;">');
	cnt.add(wframes);
	cnt.add(animview);
	cnt.add('</div>');
	
	cnt.drawTo('main');
	animview.animation = [];
	animview.animation["default"] = new Animation(animview.id, frames, 200);
	g_anim =animview.animation;
	//runThatAnim();
	//al=new Animation_loop(animview.id, 'default');
	runThatAnim();
}
var g_anim;

function runThatAnim () {
	g_anim.default.play();
	return setTimeout(runThatAnim, g_anim.default.delay);
}


/*function animate_move(actor) {

	var step, dx, dy, tx, ty, cnt;
	var a = Math.abs;
	var f = Math.floor;
	tx  = actor.gotox;
	ty = actor.gotoy;
	dx = actor.gotox - actor.x
	dy = actor.gotoy - actor.y
	if (dx===0 && dy===0) {
		if (actor.anim != 'idle') {
			actor.animate('idle');
		}
		return;
	}
	
	if (actor.xspeed === 0 && actor.yspeed === 0) {
		console.log ('set actor speed to ', actor.xspeed, actor.yspeed)
		actor.xspeed = dx/32.0;
		actor.yspeed = dy/32.0;
	}

	move(actor.id, actor.xspeed, actor.yspeed);
	actor.x = actor.x + actor.xspeed;
	actor.y = actor.y + actor.yspeed;	
	if (dy ===0 && dx===0 ) {
		console.log('stopped moving ', actor)
		moveTo(actor.id, parseInt(tx), parseInt(ty));
		actor.xspeed=0;
		actor.yspeed=0;
		actor.x = tx;
		actor.y = ty;
		clearTimeout(actor.moving);
		actor.animate('idle');
		return;
	} else {
		actor.moving = setTimeout(function(){animate_move(actor);}, 200);
	}

}*/
