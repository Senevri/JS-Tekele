//document.write('<div id="debug" ></div>');
initKeys();
initMouse();

action = null;
debug = new debug();
debug.write("debug:");

//testfoo();
//testgraphics();

//document.getElementById('main').setAttribute('onClick', 'moveTo(selected, event.clientX-16, event.clientY-16)');

/*button = new moveable("button", "show all", 500, 10);
button.clickable = clickable;
button.clickable('showId("bar")');

button2 = new moveable("button2", "mrt", 250, 30);
button2.clickable = clickable;
button2.clickable('button2.select()');
*/
//war1 = new testWar("war1");
//war1 = new moveable("war1", '', 100, 100);
//war1.testWar = testWar;
//war1.testWar();

war1 = new generateWar();

function generateWar(){
	
	this.inheritfrom = moveable
	this.inheritfrom("war1", '', 200, 100);
	//this = moveable("war1", '', 200, 100);
	this.clickable = clickable;
	this.clickable('selected='+this.id+'.select()');
	this.animation = [];
	this.animation["walk"] = new animation(this.id, ["warrior.png", "warrior2.png"], 200);
	this.animation["idle"] = new animation(this.id, ["warrior2.png", "warrior3.png"], 800);
	this.onselect=showstats;
	this.stats = {"hp":10, "atk":1, "def":15 };
	actor = this;
	anim = "idle";
	this.moveAction = moveAction;
	this.attackAction = attackAction;
	playing = setTimeout('animationloop(actor)', 200);
	return this;
}

//view_animation(["warrior.png", "warrior3.png"], 2);
//test_widgets();


Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};

function showstats(){
	//debug.write("onselect");
	//var stattext = 'HP:' + this.stats.hp + ' ATK:' + this.stats.atk + ' DEF:' + this.stats.def;
	var ostats = new widget('stats');
	//stats.add(stattext);
	genstat = function(name, value){	
		ostats.add(name.toUpperCase()+':');
		//ostats.add("fooo");
		//this = new widget(name);		
		//this.add(value.toString());
		//ostats.add(this);
		ostats.add(value.toString()+'<br />');
		//ostats.add();			
	}
	genstat('hp', this.stats.hp);
	genstat('atk', this.stats.atk);
	genstat('def', this.stats.def);
	
	var menu = '<a href="#" onClick="'+this.id+
		'.moveAction();" ><div class="button">move</div></a><a href="#" onClick="'+this.id+
		'.attackAction();"><div class="button">attack</div></a> ';
	//debug.write(stats);

	document.getElementById('menu').innerHTML = menu;
	document.getElementById('stats').innerHTML=ostats.text(); 
}

function moveAction(){
	//	debug.write("moveaction");
	action = "moveToAndDisable(selected)";
	anim="walk"
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
	debug.write(id);
//	document.getElementById('main').setAttribute('onClick', 'changeAnimation()');
}
function moveToAndDisable(id){ 
	xpos = mouse.clientX-16;
	ypos = mouse.clientY-16;
	moving=true;
	tx=xpos;
	ty=ypos;
	document.getElementById('main').setAttribute('onClick', '');
	//anim="idle"
}

function testgraphics(){
	
	helou = new moveable("helou", "hellowrld2", 200, 200);
	hobgoblin = '<img src="hobgoblin.png"/>';
	hob1 = new moveable("hob1", hobgoblin, 300, 100);
	hob1.onselect = showstats;
	hob1.stats = {"hp":22, "atk":4, "def":17 };
	hob1.moveAction=moveAction;
	hob2 = new moveable("hob2", hobgoblin, 300, 132);
	hob3 = new moveable("hob3", hobgoblin, 332, 100);
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
