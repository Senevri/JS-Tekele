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
	
	this.wrap = function(tag, params, stuff){
		this.add('<'+tag+' '+params+'>');
		this.add(stuff);
		this.add('</'+tag+'>');
	}
	
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
	}
	return this;
}

function drawWidgetsTo(id){
	var out="";
	var i=0;
	while(i<widgets.length){
		if ('undefined' != typeof widgets[i] ) {		
			out += widgets[i].text();
		}		
		i++;
	}		
	document.getElementById(id).innerHTML+=out;
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
	w.add("</div>")
	widgets.push(w0);
	widgets.push(w);
	drawWidgetsTo("main");
}
