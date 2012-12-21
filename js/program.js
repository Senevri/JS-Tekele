"use strict";
$(document).ready(function() {

if(!console) {
	var console = {};
	console.log = function(str){};
}

 // init oldstuffs

var input = OLD_Input(), xpos, ypos;



if (!window.app) window.app = {};

input.initKeys();
input.initMouse();
var selected = input.selected;
var select = input.select;

var action = null; 
window.creatures = [];
var creatures = window.creatures;
var debug = new Debug();
debug.write("debug:");

var fetchCreature = (function (id) {
	var i = 0, 
        c;
	while (i<creatures.length){
		c = creatures[i];
		if (c.id === id ) {
			return c;
		}
		i++;
	}
	return false;	
});
window.app.fetchCreature = fetchCreature;
/* Magic numbers: Square = 32, border for background = 8
 */
//testfoo();
//testgraphics();
var engineUpdate = function(){
	input = window.input;
	var c, i=0, sel = document.getElementById(selected);
	debug.clear();
	debug.write("selected: " + selected);
	//input.selected = selected;
	debug.write("action: " + action);	
	while (i<creatures.length){
		c = creatures[i];
		c.clickable('selected=window.creatures[' + i + '].select()');
		if (c.id != selected) {
			document.getElementById(c.id).style.backgroundColor='green';
		}
		if (c.xspeed===0 && c.yspeed===0){
			c.moving = false;
			c.animate("idle");
		}		
		i++;
	}
	i=0;
	if (sel) {
		c = window.app.fetchCreature(sel);		
		sel.style.backgroundColor='red'; 
        //debug.write("dy: " + c.xspeed + c.yspeed); 
	}
	setTimeout(engineUpdate, 250);
};

/* ajax can only test on actual server*/
//testAjax();

var uno = new GenerateWar("uno");
var dos = new GenerateWar("dos");
dos.stats={"hp": 12, "atk": 2, "def": 13};
dos.move(3,0);
//dos.gotox=288;
uno.animate('idle');
dos.animate('idle');
creatures.push(uno);
creatures.push(dos);

var test_one = (function (){
	debug.write("one-------");
	this.to = setTimeout(test_one, 500);
});

var test_two = (function (){
	debug.write("two++++++++");
	this.to = setTimeout(test_two, 500 );
});
//test_one();
//test_two();

function GenerateWar(id) {
	var war = new Widget(id); 
	war.add(moveableTag(id, '', 8+6*32, 8+3*32));
	war.drawTo('main');
	this.widget = war;
	this.id = this.widget.id;
	//his.inheritfrom(id, '', 200, 100);
	this.gotox=8+(6*32);
	this.gotoy=8+(3*32);
	this.x=this.gotox;
	this.y=this.gotoy;
	//debug.write(this.id);
	//this = moveable("war1", '', 200, 100);
	this.clickable = clickable;
	//this.clickable('selected=' + this.id + '.select()');
	this.animation = {};
	this.animation.attack = new Animation(this.id, ["warrior0001.png", "warrior0003.png"], 800);
	this.animation.walk = new Animation(this.id, ["warrior.png", "warrior2.png"], 200);
	this.animation.idle = new Animation(this.id, ["warrior2.png", "warrior3.png"], 800);
	this.select = select;
	this.onselect = showstats;
	this.stats = {"hp": 10, "atk": 1, "def": 15 };
	//actor = this;
	this.anim = "idle";
	this.moveAction = moveAction;
	this.attackAction = attackAction;
	this.animate = function (anima) {
		if ('undefined' === anima) {
			return;
		}
		console.log('animation: ', anima);
		this.animation[this.anim].stop();
		this.anim = anima;
		this.animation[this.anim].start();
	};

	this.move = function (x, y) {
		move(this.id, x*32, y*32);
		this.x += x*32;
		this.y += y*32;
		this.gotox = this.x;
		this.gotoy = this.y;
	};
    
	this.animate_move = function(){
		var a = Math.abs;
		var f = Math.floor;		
		var r = Math.round;
		var self = this;	

		this.moving = setTimeout( function () {
			var cur_pos = self.get_square();
			var target_pos = self.get_square(true);			
			var boundary = (cur_pos[0]<=19 && cur_pos[1]<=10);
			if (boundary && cur_pos[0] != target_pos[0] || cur_pos[1] != target_pos[1]) {
				var speedx = (8*((self.gotox-self.x)/a(self.gotox)));
				var speedy = (8*((self.gotoy-self.y)/a(self.gotoy)));
				speedx = ((a(speedx) > 8) ? 8*(speedx/a(speedx)) : speedx);
				speedy = ((a(speedy) > 8) ? 8*(speedy/a(speedy)) : speedy);
				//self.x = self.x + ((self.gotox + speedx)-self.x)>8 ? (speedx>1 ? speedx : 1) : 0;
				//self.y = self.y + ((self.gotoy + speedx)-self.y)>8 ? (speedy>1 ? speedy : 1) : 0;
				if (speedx) self.x += (a(speedx)>1 ? speedx : a(speedx)/speedx );
				if (speedy) self.y += (a(speedy)>1 ? speedy : a(speedy)/speedy );
				if (isNaN(self.y) || isNaN(self.x)) { // debug code 
					console.log('error, x/y', self.x, self.y);
					console.log('error, speeds',  speedx, speedy);
					self.y = self.gotoy;
					self.animate('idle');
					return;
				}
				moveTo(self.id, r(self.x), r(self.y));
				self.animate_move();
			} else {
				if (!boundary) {
					if (self.gotox>8+(32*19)) {
						self.gotox = 8+640-32;
					}
					if (self.gotoy>8+(32*10)) {
						self.gotoy = 8+320;
					}
				}
				self.x = self.gotox;
				self.y = self.gotoy;
				moveTo(self.id, self.x, self.y); //snap to grid
				clearTimeout(self.moving);
				self.moving = 0;
				self.animate('idle');
			}
		}, 18);
	};
	this.get_square = function(x, y){
		var round = Math.round;
		if (x===y && y===undefined) { 
			x = (this.x-8)/32;
			y = (this.y-8)/32;
		} else if (x === true && y === undefined) {
			x = (this.gotox-8)/32;
			y = (this.gotoy-8)/32;
		} else {
			x = (x-8)/32;
			y = (y-8)/32;
		}
		return [round(x), round(y)];
	};
	return this;
}

function takeDamage (){
    var w, target, attacker, dam;
	attacker = window.app.fetchCreature(seme);
	attacker.animate("idle");
	attacker.onselect = showstats;
	selected = attacker.select();
	xpos = mouse.clientX;
	ypos = mouse.clientY-32;
	dam = "-1";
	if ( Math.abs(this.x-attacker.x)<64 && Math.abs(this.y-attacker.y)<64) {
		this.stats.hp = this.stats.hp - 1;
	} else { 
		dam = "miss"; 
	}
	this.onselect=showstats;
	w = new Widget("damage");
	w.add(moveableTag("damage", dam, xpos, ypos));
	w.drawTo("main");

	seme = "";
}


view_animation(["warrior.png", "warrior3.png"], 2);
/*duud = new Widget('duud');
varjo = new generateWar();
move(varjo.id, 100,0);
duud.add(varjo);*/
//test_widgets();

Function.prototype.method = function (name, func) {
	this.prototype[name] = func; 
	return this;
};

function showstats(){
	var ostats = new Widget('stats'), menu;
	//stats.add(stattext);
	genstat = function (name, value) {	
		ostats.add(name.toUpperCase() + ':');
		ostats.add(value.toString() + '<br />');	
	};
	genstat('hp', this.stats.hp);
	genstat('atk', this.stats.atk);
	genstat('def', this.stats.def);
	
	menu = '<a href="#" onClick="window.app.fetchCreature(\'' + this.id +
		'\').moveAction();" ><div class="button">move</div></a><a href="#" onClick="window.app.fetchCreature(\'' + this.id +
		'\').attackAction();"><div class="button">attack</div></a> ';
	//debug.write(stats);

	document.getElementById('menu').innerHTML = menu; 
	//document.getElementById('stats').innerHTML=ostats.text(); }
	clear('stats')
	ostats.drawTo('stats');
}

function setOnSelect(id, func) {
	var i = 0;
	while (i<creatures.length){
			c = creatures[i];
			if (c.id!= id) {
				c.onselect = func;
			}
			i++;
		}
}
function moveAction() {
	//	debug.write("moveaction") ;
	action = moveToAndDisable;
	this.animate('walk');
	//setOnSelect(this.id, showstats);
	document.onmousemove = enableMainAction;
	//	enableMainAction();
}

function cancelAction() {
	document.getElementById('main').setAttribute('onClick', '');
	if (selected==='object') {selected = selected.id; }
	var crt = window.app.fetchCreature(selected), i=0;
	crt.xspeed=0;
	crt.yspeed=0;
	action="";
	crt.animate('idle');
	seme = "";

	while (i<creatures.length){
		c = creatures[i];
		if (c.id!= this.id) {
			c.onselect = showstats;
		}
		i++;
	}
}

function attackAction() {
	// need to make the onclick or rather onselect action attack a target.. for that we need a objectlist.
	var i = 0, c=undefined;
	var c = window.app.fetchCreature(selected)
	if (!c) c=this;
	
	c.moving=false;
	action="attackAction()";
	input.setCommand("cancelAction()");
	seme = this.id;
	c.animate("attack");
	console.log(selected);
	//document.onmousemove = enableMainAction;
	document.onmousemove = enableMainAction;
	while (i<creatures.length){
		var c = creatures[i];
		if (c.id!= this.id) {
			c.onselect = takeDamage;
		}
		i++;
	}
//	enableMainAction();
}


function enableMainAction() {
	//document.getElementById('main').setAttribute('onClick', action);
	document.onmousemove = input.getMouseXY;
	window.input.setCommand(action);
	console.log(window.input);
}

function enableCreatureAction(creature) {
	document.getElementById(creature).setAttribute('onClick', action);
	document.onmousemove = input.getMouseXY;
}

function attackTargetedObject(id) {
	var cnt = fetchCreature(id), c2;
	c2 = fetchCreature(seme); //hack
	//document.getElementById('main').setAttribute('onClick', '');
	action = null;
	//selected=cnt.id;
	cnt.onselect = showstats;
	c2.onselect = showstats;
	//cnt.anim = "idle";
	c2.animate('idle');
	clear('menu');
	hideId('menu');
	hideId('stats');
	
//	document.getElementById('main').setAttribute('onClick', 'changeAnimation()');
}
function moveToAndDisable(){
	cnt = window.input.selected;
	id = cnt.id;
	var xpos, ypos, dx=null, dy=null, a, f, mpi;
	console.log('id ', id, 'cnt', cnt)
	var a=Math.abs;
	var f=Math.floor;
	var r=Math.round;
	xpos = mouse.clientX-8; // presuming 32px sprite
	ypos = mouse.clientY-8;
	xpos = (xpos<0? 0 : xpos);
	ypos = (ypos<0? 0 : ypos);
	//document.getElementById('main').setAttribute('onClick', '');
	cnt.gotox = 8+(32*f(xpos/32)); //0-32 = 0, 33-64 = 1
	cnt.gotoy = 8+(32*f(ypos/32));
	console.log('targetsquare, currentsquare:', cnt.get_square(true), cnt.get_square());
	console.log('mouse, target:',xpos, ypos,  cnt.gotox, cnt.gotoy);
	action=null;
	cnt.animate_move();
}

engineUpdate();
var MainLoop = (function () {

//	setTimeout(engineUpdate, 500);
})();

});
