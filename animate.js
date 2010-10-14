function loadanimation(animation){
	this.animation.frames = animation;
	this.animation.curframe=0;
	this.animation.maxframe = this.animation.frames.length-1;
	this.animate = animate;
}


function animate(){
	//debug.write("animate:"+this.frames[this.curframe]);
	a = this.animation;
	//debug.write(a.curframe);
	if (a.curframe<a.maxframe){
		//debug.write("inc");
		a.curframe++;
	} else {
		//debug.write("reset");
		a.curframe=0;
	}

	this.content='<img src="'+a.frames[a.curframe]+'" style="width:32px; height:32px;"/>';
	this.animation=a;
	this.refresh();
};
