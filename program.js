var input = Input.getInstance(), xpos, ypos;

input.initKeys();
input.initMouse();
var selected = input.selected;
var select = input.select;

var action = null; 
var creatures = [];
debug = new debug();
debug.write("debug:");

//testfoo();
//testgraphics();
var engineUpdate = function(){
	var c, i=0, sel = document.getElementById(selected);
	debug.clear();
	debug.write("selected: " + selected);
	debug.write("action: " + action);	
	while (i<creatures.length){
		c = creatures[i];
		if (c.id != selected) {
			document.getElementById(c.id).style.backgroundColor='green';
		}
		if (c.xspeed===c.yspeed===0){
			//c.moving = false;
			c.anim="idle";
			c.animate();
		}		
		i++;
	}
	i=0;
	if (sel) {
		c = fetchCreature(sel);		
		sel.style.backgroundColor='red'; 
		//debug.write("dy: " + c.xspeed + c.yspeed); 		
	}
	setTimeout("engineUpdate()", 500);
}

engineUpdate();
/* ajax can only test on actual server*/
//testAjax();

uno = new generateWar("uno");
dos = new generateWar("dos");
dos.stats={"hp": 12, "atk": 2, "def": 13};
move("dos", 96, 0);
dos.gotox=288;
uno.animate();
dos.animate();
creatures.push(uno);
creatures.push(dos);

/*
test_one();
test_two();

function test_one(){
	debug.write("one-------");
	setTimeout("test_one()", 1000);
}

function test_two(){
	debug.write("two++++++++");
	setTimeout("test_two()", 500);
}
*/

function generateWar(id) {
	war = new Widget(id);
	war.add(moveableTag(id, '', 192, 96))
	war.drawTo('main');
	this.widget = war;
	this.id = this.widget.id;
	//his.inheritfrom(id, '', 200, 100);
	this.gotox=192;
	this.gotoy=96;
	this.x=192;
	this.y=96;
	//debug.write(this.id);
	//this = moveable("war1", '', 200, 100);
	this.clickable = clickable;
	this.clickable('selected=' + this.id + '.select()');
	this.animation = [];
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
	animation_stack.push(this);
	this.animate = function () {
		clearTimeout(this.playing);
		this.playing = setTimeout("Animation_loop('" + this.id + "','" + this.anim + "' )", this.animation.idle.delay);
	}
	return this;
}

function takeDamage (){
	var w, target, attacker, dam;
	attacker = fetchCreature(seme);
	attacker.anim="idle";
	attacker.animate();
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


//view_animation(["warrior.png", "warrior3.png"], 2);
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
	
	menu = '<a href="#" onClick="' + this.id +
		'.moveAction();" ><div class="button">move</div></a><a href="#" onClick="' + this.id +
		'.attackAction();"><div class="button">attack</div></a> ';
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
	//	debug.write("moveaction");
	action = "moveToAndDisable(selected)";
	this.anim = "walk";	
	this.animate();
	//setOnSelect(this.id, showstats);
	document.onmousemove = enableMainAction;
	//	enableMainAction();
}

function cancelAction() {
	document.getElementById('main').setAttribute('onClick', '');
	if (selected==='object') {selected = selected.id; }
	var crt = fetchCreature(selected), i=0;
	crt.xspeed=0;
	crt.yspeed=0;
	action="";
	crt.anim="idle";
	crt.animate();
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
	selected.moving=false;
	action="attackAction()";
	input.setCommand("cancelAction()");
	seme = this.id;
	selected.anim = "attack";
	selected.animate();
	//document.onmousemove = enableMainAction;
	document.onmousemove = enableMainAction;
	while (i<creatures.length){
		c = creatures[i];
		if (c.id!= this.id) {
			c.onselect = takeDamage;
		}
		i++;
	}
//	enableMainAction();
}

function fetchCreature(id) {
	var i = 0;
	while (i<creatures.length){
		c = creatures[i];
		if (c.id === id ) {
			return c;
		}
		i++;
	}
	return false;	
}

function enableMainAction() {
	//document.getElementById('main').setAttribute('onClick', action);
	document.onmousemove = input.getMouseXY;
	input.setCommand(action);
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
	cnt.anim = "idle";
	c2.anim = "idle";
	c2.animate();
	clear('menu');
	hideId('menu');
	hideId('stats');
	
//	document.getElementById('main').setAttribute('onClick', 'changeAnimation()');
}
function moveToAndDisable(id){ 
	var cnt = fetchContainer(id), xpos, ypos, dx=null, dy=null, a, f, mpi;
	cnt.xspeed=0;
	cnt.yspeed=0;
	a=Math.abs;
	f=Math.floor;
	xpos = mouse.clientX; // presuming 32px sprite
	ypos = mouse.clientY;
	document.getElementById('main').setAttribute('onClick', '');
	cnt.gotox = 32*f(xpos/32);
	cnt.gotoy = 32*f(ypos/32);
	cnt.moving = true;	
	
	action=null;
}
