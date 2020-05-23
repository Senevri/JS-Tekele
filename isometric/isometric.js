var objects = [
    {x: 0, y: 1, z:0, id:1},
    {x: 1, y: 1, z:0, id:1},
    {x: 0, y: 1, z:1, id:1},
    {x: 0, y: 6, z:0, id:1},
    {x: 0, y: 4, z:0, id:1},
    {x: 0, y: 3, z:0, id:1},
    {x: 0, y: 2, z:0, id:1},
    {x: 12, y: 8, z:0, id:1},
    {x: 12, y: 8, z:8, id:1},
    {x: 0, y: 8, z:8, id:1}
]

var makeground = function() {
    for (var z=0; z<8; z++) {
        for (var x = 0; x < 12; x++) { 
            objects.push({y:0, x:x, z:z, id:0})
        }
    }
}

var sortobjects = function() {
    objects.sort((a,b)=>{
        return (a.x-b.x)
    })
    objects.sort((a,b)=>{
        return (a.y-b.y)
    })
    objects.sort((a,b)=>{
        return (a.z-b.z)
    })
}

var drawloop = function(ctx) {
    sortobjects()
    for (i in objects) {
        var obj = objects[i]
        ctx.drawImage(images[obj.id], 120+obj.x*24-obj.z*8, 190-obj.y*24+obj.z*8)
    }
}

var old_drawloop = function(ctx) {
    //ctx.drawImage(images[0], 0, 0)
    for (var z=0; z<8; z++) {
        //ctx.drawImage(images[0], i*24, 0)
        //ctx.drawImage(images[0], 240, i*24)
        for (var x=0;x<12;x++) {
            for (var y=0;y<8;y++) {
                ctx.drawImage(images[0], 120+x*24-z*8, 190-y*24+z*8)
            } 
        }

    }
}
var windowsetup = function() {
    var canvas = document.getElementById("isometric")
    canvas.style.imageRendering =  "pixelated"
    canvas.width = window.innerWidth - 32
    canvas.height = window.innerHeight - 32
    ctx = canvas.getContext("2d")
    ctx.fillStyle = "#aaaaaa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(2,2)
}

window.onresize = function() {
   this.windowsetup() 
}

window.onload = function() {
    console.log("hellurei")
    this.makeground()
    this.windowsetup()
    var body = document.getElementsByTagName("body")[0]
    var imagefiles = ["color_cube.png","cube.png"]
    for (i in imagefiles) {
        var elem = document.createElement("img")
        console.log(imagefiles[i])
        elem.src = imagefiles[i]
        elem.style.imageRendering = "pixelated" 
        body.append(elem)
    }
    images = document.getElementsByTagName("img")
    window.setInterval(()=>{drawloop(ctx)}, 100)
} 