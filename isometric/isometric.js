var world = [
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
    x: 3, y:6, z:0
}

// Fixme: Not in draw order
var cursor = {
    x:6, y:0, z:0
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

var update_cursor = function(event){
    tilesize = 24*2
    let x = Math.floor(event.clientX/tilesize)
    let y = Math.floor(event.clientY/tilesize)    
    cursor.x = x-camera.x
    cursor.y = y-camera.y
    
}

document.addEventListener('mousedown', function(event) {
    update_cursor(event)
    console.log("camera", camera)
    console.log("cursor", cursor)     
    console.log(
            world.find(elem => {
            return (elem.x == cursor.x && elem.y == cursor.y && elem.z == cursor.z )
        })
    )
})

document.addEventListener('mousemove', function(event) {
    update_cursor(event)
})

var makeground = function() {
    for (var z=0; z<10; z++) {
        for (var x = 0; x < 12; x++) { 
            world.push({y:0, x:x, z:z, id:0})
        }
    }
}

var sortworld = function() {
    world.sort((a,b)=>{
        return (a.x-b.x)
    })
    world.sort((a,b)=>{
        return (a.y-b.y)
    })
    world.sort((a,b)=>{
        return (a.z-b.z)
    })
}

var drawloop = function(ctx) {
    sortworld()
    for (i in world) {
        var obj = world[i]
        var x = obj.x + camera.x
        var y = obj.y + camera.y
        var z = obj.z + camera.z        
        
        ctx.drawImage(images[obj.id], x*24-z*8, y*24+z*8)
        
    }
    drawcursor(ctx)
}

var cursor_opacity = 1
var cursor_fading = true

var drawcursor = function(ctx) {
    let shiftx = [0, 24, 0, 24]
    let shifty = [0, 0, 24, 24]
    x = (cursor.x+camera.x)*24
    y = (cursor.y+camera.y)*24
    z = (cursor.z+camera.z)*8
    ctx.strokeStyle = `rgba(0,255,0, ${cursor_opacity})`
    ctx.beginPath()
    ctx.rect(x+8-z, y+z, 24, 24)
    ctx.rect(x-z, y+8+z, 24, 24)
    for (i in shiftx) {        
        ctx.moveTo(x+8-z+shiftx[i], y+z+shifty[i])
        ctx.lineTo(x-z+shiftx[i], y+8+z+shifty[i])        
    }
    ctx.stroke()

    fade_speed = 0.01
    cursor_opacity += cursor_fading ? -fade_speed : fade_speed
    if (cursor_opacity <= 0.3) cursor_fading = false
    if (cursor_opacity >= 1.0) cursor_fading = true
    
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
