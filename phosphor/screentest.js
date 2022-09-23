(function(){
    console.log("runs")
    

    function addCanvas() {
        const myCanvas = document.createElement("canvas", )
    
        console.log("screen")
        myCanvas.id = "screen"
        myCanvas.width = 720
        myCanvas.height = 576
        
        document.getElementById("content").appendChild(myCanvas)    
        return myCanvas    
    }

    const myCanvas = addCanvas()
    clear_screen(myCanvas, "purple")

    
    function clear_screen(canvas, color="black") {
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    let index = 0
    let flipflop = false

    const sparse_color_map = {
     
    }

    for (let i=(100+(720/3*100)); i<(200+720/3*230);i++) {
        sparse_color_map[i] = [255,255,255]
    }
    
    async function refreshScreen(canvas) {
        const ctx = canvas.getContext("2d")
        const imageData = ctx.getImageData(0,0,canvas.width, canvas.height)
        
        //const defaultcolor = [255,255,255] //flipflop? 255:128
        const defaultcolor = [33,50,18]
        let modulation = 1
        let color = defaultcolor

        for (let i = 0; i < canvas.width*canvas.height/3; i++ ) {
            //console.log(i % canvas.width, Math.floor(i / canvas.width))

            
            if (!(i % canvas.width)) {
                modulation = flipflop ? 1 : 1.2    
                flipflop = !flipflop
            } 

            color = defaultcolor
            if (i in sparse_color_map) {
                color = sparse_color_map[i]
            }
            if (i>canvas.width*canvas.height/6) {
                color = [255,0,0]
            }
            //color = i in sparse_color_map ? sparse_color_map[i] :  defaultcolor

            // imageData.data[index++] = color[0]/modulation
            // imageData.data[index++] = color[1]/modulation - 35
            // imageData.data[index++] = color[2]/modulation - 35
            // imageData.data[index++] = 255
            // imageData.data[index++] = color[0]/modulation
            // imageData.data[index++] = color[1]/modulation
            // imageData.data[index++] = color[2]/modulation
            // imageData.data[index++] = 255                
            // imageData.data[index++] = color[0]/modulation - 35
            // imageData.data[index++] = color[1]/modulation - 35
            // imageData.data[index++] = color[2]/modulation
            // imageData.data[index++] = 255
        
                imageData.data[index] = ((imageData.data[index++] + 2*color[0])/modulation) / 3
                imageData.data[index] = ((imageData.data[index++] + (2*color[1])/modulation) - (35* modulation)) / 3
                imageData.data[index] = ((imageData.data[index++] + (2*color[2])/modulation) - (45* modulation)) / 3
                imageData.data[index++] = 255
                imageData.data[index] = ((imageData.data[index++] + 2*color[0])/modulation) / 3
                imageData.data[index] = ((imageData.data[index++] + 2*color[1])/modulation) / 3
                imageData.data[index] = ((imageData.data[index++] + 2*color[2])/modulation) / 3
                imageData.data[index++] = 255                
                imageData.data[index] = (imageData.data[index++] + (2*color[0]/modulation) - (45*modulation)) / 3
                imageData.data[index] = (imageData.data[index++] + (2*color[1]/modulation) - (35*modulation)) / 3
                imageData.data[index] = (imageData.data[index++] + (2*color[2]/modulation)) / 3
                imageData.data[index++] = 255
            
            if (index >= imageData.data.length) {index=0
                
            }
    
        }
        //ctx.scale(4,3)
        
        ctx.putImageData(imageData, 0, 0)
        flipflop = !flipflop
    }
    
    function runSystem(){
        let myCanvas = null
        while (!myCanvas) {
            setTimeout(()=>{}, 50)
            myCanvas = document.getElementById("screen")
        }
        console.log(myCanvas)
        clear_screen(myCanvas, "green")
        setInterval(()=> { refreshScreen(myCanvas) }, 50)
        
    } 
    runSystem()
    
})()