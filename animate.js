//var actor;
//var anim;
//var tick=false;
//var moving=false;
//var tx; 
//var ty;


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

function animationloop() {
	var container, anim;
	//dx=0;
	//dy=0;
	//if (tick==false) tick=true;
	//else tick=false;
	
	//if (actor.moving && tick){
	//	animate_move();
	//}
	//clearTimeout(container.playing);
	this.advance = function () {
		container.animation[anim].play();
		setTimeout(animationloop.advance(), container.animation[anim].delay);
	};
	//container.playing = setInterval(container.animation[anim].play(), container.animation[anim].delay);
}

function view_animation(frames, count) {
	var out, i, animview, cnt;
	out = "";
	for (i = 0; i < count; i++) {
		out += '<img src="' + frames[i] + '" />';
	}
	
	frames = new Widget('frames');
	frames.wrap("p", 'style="font-family:Courier, Monotype"', "Frames:");
	frames.add(out);
	animview = new Widget('animview');
	animview.wrap("p", 'style="font-family:Courier, Monotype;"', "Animation:");	
	animview.add('<div id="animview"></div>');	
	cnt = new Widget('container');
	cnt.add('<div style="position:absolute; float:left; left:0px; margin: 10px;">');
//	foo3.add(foo);
	cnt.add(animview);
	cnt.add('</div>');
	
	cnt.drawTo('main');
	animview.animation = [];
	animview.animation["default"] = new Animation(animview.id, frames, 200);
	//foo2.animation['default'].run();
	animview.run = animationloop();
	animview.run.container = animview;
	animview.run.anim = "default";
	//foo2.animation.animview.play();
	//makemoveable('animview');
	//move('animview', 100, 100);
	//moveTo('animview', 0, 0);
}

function animate_move(actor) {
	var step, dx, dy;
	step	= 32;
	if (dx == null) { 
		dx = (tx-actor.x);
		//debug.write(dx);
	}
	if (dy === null) {
		dy = (ty - actor.y);
		//debug.write(dy);	
	}
	if (Math.abs(actor.x-tx) > step) {
		move(actor.id, step * (dx/Math.abs(dx)), 0);
		actor.x = actor.x + step * (dx / Math.abs(dx));
	}
	if (Math.abs(actor.y-ty)>step) {
		move(actor.id, 0, step*(dy/Math.abs(dy)));			
		actor.y=actor.y+step*(dy/Math.abs(dy));
	}
	if (Math.abs(actor.x-tx)<step && Math.abs(actor.y-ty)<step) {
		this.moving=false;
		anim="idle";
		tx=actor.x;
		ty=actor.y;
		moveTo(actor.id, tx, ty);
		dx=null; dy=null;
	}
}
