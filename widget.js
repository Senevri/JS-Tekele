container_id="main";
widgets = new widget('widgets');

function widget(id){
	//var this=Object;
	this.id=id;
	this.content=[];
	this.size=0;
	this.add = function(stuff){
		this.content.push(stuff);
		this.size++;
	}
	
	this.wrap = function(tag, params, stuff){
		this.add('<'+tag+' '+params+'>');
		this.add(stuff);
		this.add('</'+tag+'>');
	};
	this.text = function(){
		var stuff;
		var out="";
		for(var i=0;i!=this.content.length;i++){
			stuff=this.content[i];
			if ('string'==typeof stuff)
				out+=stuff;
			if('object'==typeof stuff)
				out+=stuff.text();
		}
		return out;
	};
	return this;
}

function drawWidgetsTo(id){
   document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + widgets.text();
	
}

function test_widgets(){

	w0  = new widget('surprise');
	w0.add("surprise!");
	w = new widget("foo");
	
	w.add('<div style="float: right;">');
	w.add("hello, world");
	w.add("<br />");
	w2 = new widget("bar");
	w2.add("<h1>");
	w2.add("in bar");
	w2.add("</h1>");
	w.add(w2);
	w.add("</div>");
    //widgets.push(function() { var x = "function" ;});
    widgets.add("stuff<br>");
	widgets.add(w0);
	widgets.add(w);
	drawWidgetsTo("main");
}
