var storedid=new Array();

function hideId(id) {
	  document.getElementById(id).style.visibility='collapse';
	    storedid[id] = document.getElementById(id).innerHTML;
	      document.getElementById(id).innerHTML="";     	
}

function showId(id) {
	  document.getElementById(id).style.visibility='visible';
	    document.getElementById(id).innerHTML = storedid[id];
	      storedid[id]=null;
}

var objects=new Array();

function moveable(id, content, x, y){
	header = '<div id="'+id+'"class="moveable" style="position:absolute;left:' + x + 'px;top:'+ y + 'px;">'; 
	footer = "</div>";
	document.write(header + content + footer);
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
	moveable("helou", "hellowrld2", 200, 200);
	hobgoblin = '<img src="hobgoblin.png"/>';
	moveable("hob1", hobgoblin, 300, 300);

	moveable("hob2", hobgoblin, 300, 332);
}

//function eternalloop(){
//	setTimeout(eternalloop, 33);
//}
