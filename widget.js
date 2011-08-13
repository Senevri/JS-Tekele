
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
		var stuff=0;
		//var out=undefined;
		var out="";
		if(this.size>0) {
			for(i=0;i<this.content.length;i++){
				stuff=this.content[i];
				debug.write(stuff);
				if ('string'===typeof stuff) {
					out+=stuff;
				} else if('object'===typeof stuff) {
					out+=stuff.text();
				}
			}
		}
		return out; 
			
		
	};
	this.drawTo = function(id){
   		document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + this.text();
	}
	return this;
}


function test_widgets(){

	widgets = new widget('widgets');
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
	widgets.drawTo("main");
}
