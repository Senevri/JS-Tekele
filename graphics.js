var storedid=new Array();

function hideId(id) {
	  document.getElementById(id).style.visibility='collapse';
	    storedid[id] = document.getElementById(id).innerHTML;
	      document.getElementById(id).innerHTML="";     	
}

function showId(id) {
	  document.getElementById(id).style.visibility='visible';
	  if (storedid[id] != null){ 
			document.getElementById(id).innerHTML = storedid[id];
			storedid[id]=null;
		}
}

var objects=new Array();

function clickable(func){
	document.getElementById(this.id).setAttribute("onClick", func);
}

function refresh(){
	document.getElementById(this.id).innerHTML=this.content;
}

function moveable(id, content, x, y){
	this.refresh = refresh;
	this.select = select;
	this.id = id;
	this.content = content;
	this.x = x; 
	this.y = y;
	this.clickable="";
	this.header = '<div id="'+id+'"class="moveable" '+ this.clickable +' style="position:absolute;left:' + x + 'px;top:'+ y + 'px;">'; 
	this.footer = "</div>";
	function update(header, content, footer){	
		document.write(header, content, footer);
	}
	update(this.header, this.content, this.footer);
};

function move(id, xshift, yshift){ // well, this is a game logic thing anyhow.
	e = document.getElementById(id);
	x = e.style.left;
	y = e.style.top;
	x = x.substring(0,x.length-2);
	y = y.substring(0,y.length-2);
	e.style.left=((1*x)+xshift)+'px';
	e.style.top=((1*y)+yshift)+'px';
}

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

//function eternalloop(){
//	setTimeout(eternalloop, 33);
//}
