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

function clickable(func){
	document.getElementById(this.id).setAttribute("onClick", func);
}
function refresh(){
	document.getElementById(this.id).innerHTML=this.content;
}

/*
	moveable function to instant-jumping to some spot.
*/
function moveTo(id, xpos, ypos){ 
	//debug.write("moveto:"+xpos+" "+ypos );
	e = document.getElementById(id);
	e.x = xpos;
	e.y = ypos;
	e.style.left=e.x+'px';
	e.style.top=e.y+'px';
}

function moveable(id, content, x, y){
	this.refresh = refresh;
	this.select = select;
	this.id = id;
	this.content = content;
	this.x = x; 
	this.y = y;
//	this.clickable="";
	this.header = '<div id="'+id+'"class="moveable" '+ this.clickable +' style="position:absolute;left:' + x + 'px;top:'+ y + 'px;">'; 
	this.footer = "</div>";
	this.update = function (header, content, footer){	
		document.write(header, content, footer);
	}
	this.get = function (){
		return this.header + this.content + this.footer;
	}
	this.update(this.header, this.content, this.footer);
};

function move(id, xshift, yshift){ // well, this is a game logic thing anyhow.
	//debug.write("move");
	e = document.getElementById(id);
	x = e.style.left;
	y = e.style.top;
	x = x.substring(0,x.length-2);
	y = y.substring(0,y.length-2);
	e.style.left=((1*x)+xshift)+'px';
	e.style.top=((1*y)+yshift)+'px';
}
function makemoveable(id){
	e = document.getElementById(id);
	e.style.position='absolute';	
}

