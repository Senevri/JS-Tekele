(function (){

function sleep(ms)
	{
		var dt = new Date();
		dt.setTime(dt.getTime() + ms);
		while (new Date().getTime() < dt.getTime());
	}

var input = window.input;
var widgets = [];

//dynfluid.js
input.initKeys();
input.initMouse();
//just because.  not needed really
widgets.push(new Widget('init'));
foo = new Widget('foo');
kangas = new Widget('kangas');
//foo.add("<p>hello world</p>");
kangas.add("<canvas id='dk' width=600 height=300></canvas>");
foo.add("<a href='' onclick='step()'>klik</a>")
//widgets.push(foo);
widgets.push(kangas);
//drawWidgetsTo('main');
for (i in widgets){
	widgets[i].drawTo('main')
}
var canvas = document.getElementById('dk');
canvas.style.marginLeft = 'auto';
canvas.style.marginRight = 'auto';
if (canvas.getContext){
	/* do stuff here*/
	//----
	var x = 0;
	var n = 0;
	var surface = [];
	//var momentum = [];
	
	var i=0;
	while(i<100){
		surface.push(Math.floor(Math.random()*255));
		i++;
	}
	//surface[0] = 0;
	//surface[25] = 0;
	//surface[50] = 255
	//surface[45] = 255
	//surface[60] = 255
	//surface[88] = 255
	//surface[99] = 255
	var momentum = surface.slice(0);
	while( i < surface.length){
		momentum[i]=0;
	}
	
	var ctx = canvas.getContext('2d');
	//* draw loop
	
	var j = 0;
	//doStuff(ctx);
	//stamGrid(ctx); 
	time = 0;
	stamGrid_wrap(ctx);	
	//----
	
}

var time;
function stamGrid_wrap(ctx){
	time += 1;
	if (time == 20){
		time = 0;
		surface[44]=255;
	}
	stamGrid(ctx);
	setTimeout(function() { stamGrid_wrap(ctx) }, 30);
}

function stamGrid(ctx){
	//käytetään surfacea 10x10 gridinä 
	var GtoL = function(x, y){
		return (y*10+x);
	}
	var LtoG = function(i){
		var y = Math.floor(i/10);
		var x = i-(10*y);
		return {'x':x, 'y':y}
		//return [x,y];
	}
	this.GtoL = GtoL;
	this.LtoG = LtoG;
	//diffuse
	
	i = 0;
	
	while( i < surface.length-1){
	 /* for each location in the grid 
	  * if density is higher than neighbours, exchange some mass with
	  * the neighbour.
	  */
		//left, right, up, down
		var cur = surface[i];
		var curm = cur+momentum[i];
		var coords = LtoG(i);
		var lost_mass = 0;
		if (coords.x<9 && curm>surface[i+1]) {
			lost_mass++;
			surface[i+1]++;
			momentum[i+1]=(cur-surface[i+1]);
		}
		if (coords.x>0 && curm>surface[i-1]) {
			lost_mass++;
			surface[i-1]++;
			momentum[i-1] +=(cur-surface[i-1]);
		}
		//var cur = surface[i];
		var loc = GtoL(coords.x, coords.y-1);
		var curm = cur+momentum[loc];
		if (coords.y>0 && curm>surface[loc]){
			lost_mass++;
			surface[loc]++;
			momentum[loc] +=(cur-surface[i-10]);
		}	
		loc = GtoL(coords.x, coords.y+1);
		if(coords.y<9 && curm>surface[loc]){
			lost_mass++;
			surface[loc]++;
			momentum[loc] +=(cur-surface[i+10]);
		}
		surface[i] = surface[i]-(lost_mass);
		i++;			
		//debug.write("foo");
	}
	
	i = 0;
	while( i < surface.length){
	 /* for each location in the grid
	  * if there's momentum
	  */
		//left, right, up, down
		var cur = surface[i];
		var coords = LtoG(i);
		var lost_mass = 0;
		if(momentum[i]>0) {
			//surface[i] = surface[i] - 4;
			momentum[i]=momentum[i]-4;
			if (coords.x<9) {
				surface[i+1] = surface[i+1] + 1;
				} else {
				momentum[i]++	
			}
			if (coords.x>0) {
				surface[i-1] = surface[i-1] + 1;	
				} else {
				momentum[i]++	
			}
			//var cur = surface[i];
			var loc = GtoL(coords.x, coords.y-1);
			if (coords.y>0){
				surface[i-10] = surface[i-10] + 1;
				}	
			loc = GtoL(coords.x, coords.y+1);
			if(coords.y<9){
				surface[i+10] = surface[i+10] + 1;
				}

		}
		
		i++;			
		//debug.write("foo");
	}
	
	i = 0;
	
	
	
	ctx.clearRect(0,0,500,400);
		
		//draw
	ctx.beginPath();
	ctx.moveTo(0,100);
	var x=0; 
	var y=0;
	while( i < surface.length){
		//ctx.drawColor('green');
		//ctx.Color(surface[i]);
		ctx.fillStyle = 'rgb(0,100,'+ surface[i] +')';
		ctx.fillRect(x*10,y*10,10,10);
		//ctx.lineTo(i*5, surface[i]);
		x++;
		if (x==10) {
			x = 0;
			y++;
		}
		i++;
	}	
	ctx.fill();
	//var t = setTimeout("stamGrid(ctx)", 200);
}
/*
function doStuff(ctx){
	i=1;
	var tmp = surface.slice(0);
	var min_diff=0.1;
	
	while( i < surface.length-1){
		//if( surface[i]!=surface[i+1] ) {
			var a = surface[i];
			var b = surface[i+1];
			var c = surface[i-1];
			//var d = a-b;
			//tmp[i] = Number(a+( (b-a)/10 ));
		//}
			//calculate diffusion step

		if (a>c) { 
			momentum[i-1]=(momentum[i-1]+(a-c)/3);
			var d = (min_diff+momentum[i])/2;
			tmp[i-1] = tmp[i-1] + (d);	
			tmp[i] = tmp[i] - (d);
			
		}
		if (a>b){ // if a has higher density than b...
			momentum[i+1]=(momentum[i+1]+(a-b)/3);
			var d = (min_diff+momentum[i])/2;
			tmp[i] = tmp[i] - (d); //stuff flows from a...
			tmp[i+1] = tmp[i+1] + (d);//to b.
			
		}
		//calculate momentum
		
					
		i++;
	
	surface = tmp.slice(0);
	//momentum
	
	i=1;
	while( i < surface.length-1){
		if(momentum[i]>0)
		surface[i-1] = surface[i-1] - momentum[i]/8;
		surface[i] = surface[i] + momentum[i]/4;
		surface[i+1] = surface[i+1] - momentum[i]/8;
		momentum[i] = momentum[i]/2;
		i++;
	}

	//external forces
	
	i=0;
	
	
	
	ctx.clearRect(0,0,500,400);
		
		//draw
	ctx.beginPath();
	ctx.moveTo(0,100);
	while( i < surface.length){
		//ctx.fillRect(i*5,0,5,surface[i]);
		ctx.lineTo(i*5, surface[i]);
		i++;
	}	
	ctx.fill();
	var t = setTimeout("doStuff(ctx)", 200);
}
*/
})();
