container_id="main";
widgets = [];

function widget(id){
	//var this=Object;
	this.id=id;
	this.content=[]
	this.size=0;
	this.add = function(stuff){
		this.content.push(stuff);
		this.size++;
	}
	this.text = function(){
		var stuff;
		out="";
		for(i=0;i<this.content.length;i++){
			stuff=this.content[i];
			if ('string'==typeof stuff)
				out+=stuff;
			if('object'==typeof stuff)
				out+=stuff.text();
		}
		return out;
	}
	return this;
}

function drawWidgetsTo(id){
	debug.write(widgets.length);
	for(i=0;i!=widgets.length;i++){
			w=widgets[i];
		document.getElementById(id).innerHTML=w.text();
	}
}

function test_widgets(){

	w = new widget("foo");
	
	w.add("hello, world");
	w2 = new widget("bar");
	w2.add("in bar");
	w.add(w2);
	widgets.push(w);
	drawWidgetsTo("main");
}