function sleep(ms)
	{
		var dt = new Date();
		dt.setTime(dt.getTime() + ms);
		while (new Date().getTime() < dt.getTime());
	}

//dynfluid.js
initKeys();
initMouse();
//just because.  not needed really
widgets.push(new widget('init'));
foo = new widget('foo');
kangas = new widget('kangas');
//foo.add("<p>hello world</p>");
kangas.add("<canvas id='dk' width=600 height=300></canvas>");
foo.add("<a href='' onclick='step()'>klik</a>")
//widgets.push(foo);
widgets.push(kangas);
drawWidgetsTo('main')
var canvas = document.getElementById('dk');
if (canvas.getContext){
	/* do stuff here*/
	//----
	var x = 0;
	var n = 0;
	var surface = [];
	//var momentum = [];
	
	var i=0;
	while(i<100){
		surface.push(100);
		i++;
	}
	surface[25] = 50;
	surface[50] = 200
	var momentum = surface.slice(0);
	while( i < surface.length){
		momentum[i]=0;
	}
	
	var ctx = canvas.getContext('2d');
	//* draw loop
	
	var j = 0;
	doStuff(ctx);
	
		//setTimeout("", 1000);
	
	//----
	
}

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
			momentum[i-1]=(2*momentum[i-1]+(a-c)/3);
			var d = (min_diff+momentum[i])/2;
			tmp[i-1] = tmp[i-1] + (d);	
			tmp[i] = tmp[i] - (d);
			
		}
		if (a>b){ // if a has higher density than b...
			momentum[i+1]=(2*momentum[i+1]+(a-b)/3);
			var d = (min_diff+momentum[i])/2;
			tmp[i] = tmp[i] - (d); //stuff flows from a...
			tmp[i+1] = tmp[i+1] + (d);//to b.
			
		}
		//calculate momentum
		
					
		i++;
	}
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
