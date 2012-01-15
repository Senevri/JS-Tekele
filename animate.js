//var actor;
//var anim;
//var moving=false;
//var tx; 
//var ty;
var animation_stack = [];

function is_array(input) {
    return typeof (input) === 'object' && (input instanceof Array);
}
function Animation(id, fr, delay) {
	if (this.animation === 'undefined') {
		this.animation = []
	}
	this.playing = 0;
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
		this.content = '<img src="' + a.frames[a.curframe] + '" style="width:32px; height:32px;"/>';
		this.refresh( );	
	};
}

var dx = null;
var dy = null;
function fetchContainer(id) {
	var container, i = 0;
	while (i<animation_stack.length) {
		container = animation_stack[i];
		if (container.id === id) { break; }
		i++;
	}
	return container; //correct or last container
}

function Animation_loop(widget) {
	var tick, i = 0, a, container;
	//dx=0;
	container = fetchContainer(widget);
	var anim = container.anim;
	a = container.animation[anim];
    if (0!=a.playing) {
		clearTimeout(a.playing);
		a.playing = 0;
	}
	if (a.tick==false) a.tick=true;
	else a.tick=false;
	
	this.setContainer = function (cnt)  {
		container = cnt;
	}
	if (container.moving && a.tick){
		animate_move(container);
	}
	a.play();
	var closure = function (){
		Animation_loop(container.id);
	}
	container.playing  = setTimeout(closure, a.delay);
	a.playing = container.playing; 
	
	
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
	animation_stack.push(animview); // any widget with an animation needs to be pushed there.
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


function animate_move(actor) {

	var step, dx, dy, tx, ty, cnt;
	var a = Math.abs;
	var f = Math.floor;
	tx  = actor.gotox;
	ty = actor.gotoy;
	dx = actor.gotox - actor.x
	dy = actor.gotoy - actor.y
	
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
		actor.moving = false;
		actor.anim = "idle";
	}
}
