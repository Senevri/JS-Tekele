var objects = [
    {x: 0, y: 1, z:0, id:1},
    {x: 1, y: 1, z:0, id:1},
    {x: 0, y: 1, z:1, id:1},
    {x: 0, y: 6, z:0, id:1},
    {x: 0, y: 5, z:0, id:1},
    {x: 0, y: 8, z:0, id:0},
    {x: 0, y: 7, z:0, id:1},
    {x: 0, y: 4, z:0, id:1},
    {x: 0, y: 3, z:0, id:1},
    {x: 0, y: 2, z:0, id:1},
    {x: 12, y: 8, z:0, id:0},
    {x: 12, y: 8, z:8, id:0},
    {x: 0, y: 8, z:8, id:0}
]

var camera = {
    x: 0, y:0, z:0
}

var cursor = {
    x:8, y:7, z:4
}

// #INPUT

document.addEventListener('keydown', function(event) {
    camera_moves = {
        "w": () => {camera.z--},
        "s": () => {camera.z++},
        "a": () => {camera.x--},        
        "d": () => {camera.x++},
        "q": () => {camera.y--},
        "e": () => {camera.y++},
        "default": () => {console.log(event.key)}
    }
    move = camera_moves[event.key] || camera_moves["default"]
    move()
    ctx.clearRect(0,0, canvas.width, canvas.height)
    ctx.fillRect(0,0, canvas.width, canvas.height)

});

var makeground = function() {
    for (var z=-2; z<10; z++) {
        for (var x = -2; x < 12; x++) { 
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
        var x = obj.x + camera.x
        var y = obj.y + camera.y
        var z = obj.z + camera.z        
        
        ctx.drawImage(images[obj.id], 120+x*24-z*8, 192-y*24+z*8)
        
    }
    drawcursor(ctx)
}

var drawcursor = function(ctx) {
    points = [        
        24,0,
        24,24,
        0,24,
        0,0,
        24, 0,
        0,0
        
    ]

    x = cursor.x*24
    y = cursor.y*24
    z = cursor.z*8
    ctx.strokeStyle = "#00ff00"    
    ctx.beginPath()
    ctx.moveTo(x+8-z, y+z);
    for (i=0; i<points.length; i+=2) 
    {
        console.log(points.length, i)
        if (points[i+1] != "undefined") {
            ptx = points[i]+x+8-z
            pty = points[i+1]+y+z
            ctx.lineTo(ptx, pty);                    
            ctx.stroke();
        }
    }
    ctx.moveTo(x-z, y+8+z);
    for (i=0; i<points.length; i+=2) 
    {
        console.log(points.length, i)
        if (points[i+1] != "undefined") {
            ptx = points[i]+x-z
            pty = points[i+1]+y+8+z
            ctx.lineTo(ptx, pty);                    
            
            ctx.stroke();
        }
    }
    ctx.moveTo(x-z, y+8+z)
    ctx.lineTo(x-z+8, y+z)
    ctx.moveTo(x+24-z, y+24+8+z)
    ctx.lineTo(x+24+8-z, y+24+z)
    ctx.moveTo(x-z, y+24+8+z)
    ctx.lineTo(x+8-z, y+24+z)
    ctx.moveTo(x+24-z, y+8+z)
    ctx.lineTo(x+24+8-z, y+z)

    ctx.stroke();

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
    canvas = document.getElementById("isometric")
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
    window.setInterval(()=>{drawloop(ctx)}, 10)
} 
