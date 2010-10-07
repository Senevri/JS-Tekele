//document.writeln('hellowrld');
//document.write('<div id="debug" ></div>');

debug = new debug();
debug.write("debug:");
testfoo();

testgraphics();

document.getElementById('main').setAttribute('onClick', 'moveTo(selected, event.clientX-16, event.clientY-16)');

button = new moveable("button", "show all", 500, 10);
button.clickable = clickable;
button.clickable('showId("bar")');

button2 = new moveable("button2", "mrt", 500, 30);
button2.clickable = clickable;
button2.clickable('button2.select()');
war1 = new moveable("warrior", '<img src="warrior.png"/>', 200, 300);
war1.clickable = clickable;
war1.clickable('selected = war1.select()');
war1.onselect=animate;
war1.frames = ["warrior.png", "warrior2.png"];
war1.curframe = 0;
war1.maxframe = 1;

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

function animate(){
//debug.write("animate:"+this.frames[this.curframe]);
if (this.curframe<this.maxframe){
	this.curframe++;
} else {
	this.curframe=0;
}
this.content='<img src="'+this.frames[this.curframe]+'"/>';
this.refresh();
};

function testgraphics(){
	initKeys();
	helou = new moveable("helou", "hellowrld2", 200, 200);
	hobgoblin = '<img src="hobgoblin.png"/>';
	hob1 = new moveable("hob1", hobgoblin, 300, 300);

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
