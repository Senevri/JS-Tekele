//var actor;
//var anim;
//var tick=false;
//var moving=false;
//var tx; 
//var ty;


function is_array(input){
    return typeof(input)=='object'&&(input instanceof Array);
}
function animation_init(){
	this.animation = [];
}
function animation(id, fr, delay){
	this.id = id;
	//this.frames;
	this.frames = fr;	
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

function animationloop(){
	var container;
	var anim;
	//dx=0;
	//dy=0;
	//if (tick==false) tick=true;
	//else tick=false;
	
	//if (actor.moving && tick){
	//	animate_move();
	//}
	//clearTimeout(container.playing);
	this.advance=function(){
		container.animation[anim].play();
		setTimeout(animationloop.advance(), container.animation[anim].delay);
	}
	//container.playing = setInterval(container.animation[anim].play(), container.animation[anim].delay);
}

function view_animation(frames, count){
	out="";
for (i=0;i<count;i++){
		out+='<img src="'+frames[i]+'" />';
	}
	
	foo = new widget('frames');
	foo.wrap("p", 'style="font-family:Courier, Monotype"', "Frames:");
	foo.add(out);
	foo2 = new widget('animview');
	foo2.wrap("p",'style="font-family:Courier, Monotype;"',"Animation:");	
	foo2.add('<div id="animview"></div>');	
	foo3 = new widget('container');
	foo3.add('<div style="position:absolute; float:left; left:0px; margin: 10px;">');
//	foo3.add(foo);
	foo3.add(foo2);
	foo3.add('</div>');
	
	foo3.drawTo('main');
	foo2.animation = [];
	foo2.animation["default"]=new animation(foo2.id, frames, 200);
	//foo2.animation['default'].run();
	foo2.run = animationloop();
	foo2.run.container=foo2;
	foo2.run.anim="default";
	//foo2.animation.animview.play();
	//makemoveable('animview');
	//move('animview', 100, 100);
	//moveTo('animview', 0, 0);
}

function animate_move(){
	step = 32;
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
		this.moving=false;
		anim="idle";
		tx=actor.x;
		ty=actor.y;
		moveTo(actor.id, tx, ty);
		dx=null; dy=null;
	}
}
