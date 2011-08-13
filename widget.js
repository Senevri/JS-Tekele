/* widget constructor */
function Widget(id) {
	//var this=Object;
	this.id = id;
	this.content = [];
	this.size = 0;
	this.add = function (stuff) {
		this.content.push(stuff);
		this.size = this.size + 1;
	};
	
	this.wrap = function (tag, params, stuff) {
		this.add('<' + tag + ' ' + params + '>');
		this.add(stuff);
		this.add('</' + tag + '>');
	};
	this.text = function () {
		var stuff, out, i;
		stuff = null;
		//var out=undefined;
		out = '';
		if (this.size > 0) {
			for (i = 0; i < this.content.length; i = i + 1) {
				stuff = this.content[i];
				if (stuff === null) { stuff = ""; }
				//debug.write(stuff);
				if ('string' === typeof stuff && stuff) {
					out += stuff;
				} else if ('object' === typeof stuff) {
					out += stuff.text();
				}
			}
		}
		return out!=null ? out : ""; 
			
		
	};
	this.drawTo = function (id) {
		document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + this.text();
	};
	return this;
}


function test_widgets() {
	var widgets, w0, w, w2;
	widgets = new Widget('widgets');
	w0  = new Widget('surprise');
	w0.add("surprise!");
	w = new Widget("foo");
	
	w.add('<div style="float: right;">');
	w.add("hello, world");
	w.add("<br />");
	w2 = new Widget("bar");
	w2.add("<h1>");
	w2.add("in bar");
	w2.add("</h1>");
	w.add(w2);
	w.add("</div>");
    //widgets.push(function() { var x = "function" ;});
    widgets.wrap("h3", 'style="color:rgb(230,0,0);"', "stuff:<br>");
	widgets.add(w0);
	widgets.add(w);
	widgets.drawTo("main");
}
