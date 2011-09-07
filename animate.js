//var actor;
//var anim;
//var moving=false;
//var tx; 
//var ty;
var animation_stack = [];

function is_array(input) {
    return typeof (input) === 'object' && (input instanceof Array);
}
function animation_init() {
	this.animation = [];
}
function Animation(id, fr, delay) {
	if (this.animation === 'undefined') {
		animation_init();
	}
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
		this.refresh();	
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
	return container;
}

function Animation_loop(widget, anim) {
	var tick, i = 0, a, container;
	//dx=0;
	container = fetchContainer(widget);
	a = container.animation;
	if (a.tick==false) a.tick=true;
	else a.tick=false;
	
	if (container.moving && a.tick){
		animate_move(container);
	}
	//clearTimeout(container.playing);
	this.setContainer = function (cnt)  {
		container = cnt;
		//debug.write(this.container.id);
	}
	a[anim].play();
	clearTimeout(container.playing);
	(container.playing = setTimeout(('Animation_loop("'+container.id+'", "'+anim+'")'), a[anim].delay));
	
}

function view_animation(frames, count) {
	var al, out, i, wframes, animview, cnt;
	out = "";
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
	al=new Animation_loop(animview.id, 'default');
}
var g_anim;

function runThatAnim () {
	g_anim.default.play();
	setTimeout("runThatAnim()", g_anim.default.delay);

}


function animate_move(actor) {

	var step, dx, dy, tx, ty, cnt;
	dx = ((actor.gotox/32) - (actor.x/32));		
	dy = ((actor.gotoy/32) - (actor.y/32));		

	cnt = actor;
	if (f(a(dx)) > 0) {
		cnt.xspeed=( a(dx)>a(dy) ? 8*dx/a(dy): 8*dx/a(dx));
	}
	if (f(a(dy)) > 0) {
		cnt.yspeed=(a(dy)>a(dx) ? 8*dy/a(dx) : 8*dy/a(dy));
	}
	step = 8;
	tx  = actor.gotox;
	ty = actor.gotoy;
	move(actor.id, actor.xspeed, actor.yspeed);
	if (Math.abs(actor.x - tx) < step) {
		actor.xspeed=0;
		//moveTo(actor.id, parseInt(tx), actor.y);
		
		}
	if (Math.abs(actor.y - ty) < step) {
		actor.yspeed=0;
		//moveTo(actor.id, actor.x, parseInt(ty));
	}
	actor.x = actor.x + actor.xspeed;
	actor.y = actor.y + actor.yspeed;	
	if (dy ===0 && dx===dy ) {
		actor.moving = false;
		actor.anim = "idle";
		actor.animate();
		moveTo(actor.id, parseInt(tx), parseInt(ty));		
	}
}
