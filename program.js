//document.writeln('hellowrld');
//document.write('<div id="debug" ></div>');
initKeys();
initMouse();

action = null;
debug = new debug();
debug.write("debug:");
testfoo();

testgraphics();

//document.getElementById('main').setAttribute('onClick', 'moveTo(selected, event.clientX-16, event.clientY-16)');

button = new moveable("button", "show all", 500, 10);
button.clickable = clickable;
button.clickable('showId("bar")');

button2 = new moveable("button2", "mrt", 500, 30);
button2.clickable = clickable;
button2.clickable('button2.select()');
//war1 = new testWar("war1");
war1 = new moveable("war1", '', 200, 300);
war1.testWar = testWar;
war1.testWar();

function testWar(){
//this = new moveable(name, '<img src="warrior.png"/>', 200, 300);

this.clickable = clickable;
//var params = 'selected=' + this.id + '.select()';
this.clickable('selected='+this.id+'.select()');
//this.animation = new animation_init();
this.animation = new animation(this.id, ["warrior.png", "warrior2.png"])
this.animation = new animation(this.id, ["warrior.png", "warrior.png", "warrior2.png"])

this.onselect=showstats;
this.stats = {"hp":10, "atk":1, "def":15 };
eternalloop();;
this.moveAction = moveAction;
this.attackAction = attackAction;

}
function eternalloop(){
	war1.animation.play(0);
	setTimeout(eternalloop, 200);
}

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

function showstats(){
	//debug.write("onselect");
	var stats = 'HP:' + this.stats.hp + ' ATK:' + this.stats.atk + ' DEF:' + this.stats.def;
	var menu = '<a href="#" onClick="'+this.id+'.moveAction();" >move</a>|<a href="#" onClick="'+this.id+'.attackAction();">attack</a> ';
	//debug.write(stats);

	document.getElementById('menu').innerHTML = menu+stats; 
}

function moveAction(){
//	debug.write("moveaction");
	action = "moveToAndDisable(selected)";
	document.onmousemove = enableMainAction;
//	enableMainAction();
}

function attackAction(){
	// need to make the onclick or rather onselect action attack a target.. for that we need a objectlist.
	action="attackTargetedObject(selected)";
	document.onmousemove = enableMainAction;
//	enableMainAction();
}


function enableMainAction(){
	document.getElementById('main').setAttribute('onClick', action);
	document.onmousemove=getMouseXY;
}

function attackTargetedObject(id){
	debug.write(selected);
	document.getElementById('main').setAttribute('onClick', '');
}
function moveToAndDisable(id){ 
	//debug.write("moveto:"+xpos+" "+ypos );
	xpos = mouse.clientX-16;
	ypos = mouse.clientY-16;

	e = document.getElementById(id);
	e.x = xpos;
	e.y = ypos;
	e.style.left=e.x+'px';
	e.style.top=e.y+'px';
	document.getElementById('main').setAttribute('onClick', '');
}

function testgraphics(){
	
	helou = new moveable("helou", "hellowrld2", 200, 200);
	hobgoblin = '<img src="hobgoblin.png"/>';
	hob1 = new moveable("hob1", hobgoblin, 300, 300);
	hob1.onselect = showstats;
	hob1.stats = {"hp":22, "atk":4, "def":17 };
	hob1.moveAction=moveAction;
	hob2 = new moveable("hob2", hobgoblin, 300, 332);
	hob3 = new moveable("hob3", hobgoblin, 332, 300);
	hob1.clickable=clickable;
	hob1.clickable('selected = hob1.select()');
	hob2.clickable=clickable;
	hob2.clickable('selected = hob2.select()');
	hob3.clickable=clickable;
	hob3.clickable('selected = hob3.select()');
	
}

function testfoo(){
	bar = new moveable("bar", "'ello, 'ello", 500, 500);
	bar.clickable = clickable;
	//bar.refresh=refresh;
	bar.content = "allon-zie, alonso!";
	bar.refresh();
	bar.clickable('hideId("bar")');
}
