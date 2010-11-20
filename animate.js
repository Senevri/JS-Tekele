function is_array(input){
    return typeof(input)=='object'&&(input instanceof Array);
}
function animation_init(){
	this.animation = [];
}
function animation(id, animation){
	this.id = id;
	this.frames;
	this.frames = animation;	
	this.curframe = 0;
	this.maxframe = this.frames.length-1;
	this.refresh = function () {
		document.getElementById(this.id).innerHTML=this.content;
	}
	this.play = function(){
		a = this;
		if (a.curframe<a.maxframe){
			a.curframe++;
		} else {
			a.curframe=0;
		}
		this.content='<img src="'+a.frames[a.curframe]+'" style="width:32px; height:32px;"/>';
		this.refresh();
	};
};