//document.writeln('hellowrld');
//document.write('<div id="debug" ></div>');
debugWrite("debug:");
testfoo();

testgraphics();
button = new moveable("button", "show all", 500, 10);
button.clickable = clickable;
button.clickable('showId("bar")');

button2 = new moveable("button2", "mrt", 500, 30);
button2.clickable = clickable;
button2.clickable('button2.select()');


Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};


function testfoo(){
	bar = new moveable("bar", "'ello, 'ello", 500, 500);
	bar.clickable = clickable;
	//bar.refresh=refresh;
	bar.content = "ally-ons!";
	bar.refresh();
	bar.clickable('hideId("bar")');
}