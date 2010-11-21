var actor;
var anim;
var tick=false;
var moving=false;
var tx; 
var ty;


function is_array(input){
    return typeof(input)=='object'&&(input instanceof Array);
}
function animation_init(){
	this.animation = [];
}
function animation(id, animation, delay){
	this.id = id;
	this.frames;
	this.frames = animation;	
	this.delay = delay;
	this.curframe = 0;
	this.maxframe = this.frames.length-1;
	this.refresh = function () {
		document.getElementById(this.id).innerHTML=this.content;
	}
	this.play = function(){
		a = this;
		if (a.curframe<a.maxframe){
			a.curframe++;
		} else {
			a.curframe=0;
		}
		this.content='<img src="'+a.frames[a.curframe]+'" style="width:32px; height:32px;"/>';
		this.refresh();
	};
};

	dx=null;
	dy=null;

function animationloop(actor){
	//dx=0;
	//dy=0;
	if (tick==false) tick=true;
	else tick=false;
	
	if (moving && tick){
		animate_move();
	}
	actor.animation[anim].play();
	playing = setTimeout("animationloop(actor)", actor.animation[anim].delay);
}

function animate_move(){
	step = 16;
	if (dx==null) { 
		dx = (tx-actor.x);
		//debug.write(dx);
	}
	if (dy==null) {
		dy = (ty-actor.y);
		//debug.write(dy);	
	}
	if (Math.abs(actor.x-tx)>step) {
		move(actor.id, step*(dx/Math.abs(dx)), 0);
		actor.x=actor.x+step*(dx/Math.abs(dx));
	}
	if (Math.abs(actor.y-ty)>step) {
		move(actor.id, 0, step*(dy/Math.abs(dy)));			
		actor.y=actor.y+step*(dy/Math.abs(dy));
	}
	if (Math.abs(actor.x-tx)<step && Math.abs(actor.y-ty)<step) {
		moving=false;
		anim="idle";
		actor.x=tx;
		actor.y=ty;
		moveTo(actor.id, tx, ty);
		dx=null; dy=null;
	}
}