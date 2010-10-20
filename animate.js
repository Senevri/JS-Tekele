function is_array(input){
    return typeof(input)=='object'&&(input instanceof Array);
}
function animation_init(){
	this.animation = [];
}
function animation(id, animation){
	var index = 0;
	this.id = id;
	if(is_array(this.animation)) {
		index = this.animation.length;
	} else { 
		this.animation = [] ;
		index =0;
	}
	debug.write(index);
	this.animation[index] = frames;
	this.animation[index].frames = animation;	
	this.animation[index].curframe = 0;
	this.animation[index].maxframe = this.animation[index].frames.length-1;
	this.refresh = function () {
		document.getElementById(this.id).innerHTML=this.content;
	}

	this.play = function(index){
		a = this.animation[index];
		if (a.curframe<a.maxframe){
			a.curframe++;
		} else {
			a.curframe=0;
		}
		this.content='<img src="'+a.frames[a.curframe]+'" style="width:32px; height:32px;"/>';
		this.animation[index]=a;
		this.refresh();
	};
};