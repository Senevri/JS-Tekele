window.onload = ()=>{
    
    const audioContext = new AudioContext()
    // const oscillator1 = audioContext.createOscillator()    
    // oscillator1.type = "sine"
    const oscillatortypes = ["sine", "square", "sawtooth", "triangle"]
    
    // oscillator1.frequency.setValueAtTime(260, audioContext.currentTime)
    //oscillator1.detune.setValueAtTime(0, audioContext.currentTime)
    
    // oscillator1.start()
    // oscillator1.connect(audioContext.destination)

    const source = audioContext.createBufferSource()
    const duration = 10
    const bps = 16
    const samplerate = 44100
    
    const sound = new Uint8Array(44+(samplerate*duration*bps/8)) // 16bit values
    const total_len = sound.length-8
    const audiolen = ((sound.length)-44)
    
    //Wav header
    const header = "RIFF".split("")
                    .map(l=>l.charCodeAt(0))
                    .concat(
                        total_len & 0xff, total_len>>8, total_len >> 16, 0,
                        "WAVE".split("")
                        .map(v=>v.charCodeAt(0)), 
                        "fmt".split("")
                        .map(v=>v.charCodeAt(0)), 
                        32,
                        16,0,0,0, 
                        1,0,
                        1,0,
                        samplerate & 0xff, samplerate>>8, 0, 0, //sample rate
                        (samplerate*bps*1/8) & 0xff, (samplerate*16*1/8)>>8, (samplerate*16*1/8)>>16, 0, 
                        1*bps/8, 0,
                        16, 0, // bits per sample
                        "data".split("")
                        .map(v=>v.charCodeAt(0)), 
                        (audiolen) & 0xff, (audiolen)>>8, (audiolen) >> 16, 0
                    )
    console.log(header) 
    
    for (let i=0; i < header.length; i++) {
        sound[i] = header[i]
    }

    //console.log(sound)

    let volume = 1//between 0 and 1 
    let attack = 0.2//How long to reach peak volume
    let decay = 1 //How long to drop to sustain levels
    let sustain = 0.0
    let types = ["noise", "sine", "square"]
    let type=types[2]

    let frequency = 160 
     //DEBUG: 50=50 100 = 300, 200 = 300, 300 = 150
    let release = 0 // TODO: Implement


    let getSample = (type, index) => {    
        let types = {
            "noise": ()  => {return Math.random()},
            "sine" : (i) => {
                return (
                    Math.sin(
                        (frequency*Math.PI/2*((i % samplerate)/samplerate) % Math.PI)
                        )
                    )
            },
            "square": (i) => { 
                return (
                    ((frequency*duration*i)% audiolen) /audiolen 
                )
            }
        }
        return types[type](index)
    }
    
    
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    
    //literally noise
    for(let i=0; i<audiolen; i = i + bps/8) {
        let arr_i = i+44
        let remainder = audiolen-i
        if (i>audiolen) break;
        //console.log(volume)
        //console.log(i/audiolen, Math.PI*duration*(i/audiolen))
        volume = 1//clamp(
            //1 - (1-(i/audiolen))
            //- (attack ? (1 - ((i/attack)/audiolen)) : 0) // attack 
            //- (i < (attack * audiolen) ? 0 : 
            //    i/audiolen)
            //- (i/audiolen)
                //(decay ? ((i-(attack*audiolen))*decay/(attack*audiolen)): 0 )) //decay
            
            //- ((i/audiolen) * decay ? decay: 0) - i/audiolen
            //, (i<((attack+decay)*audiolen) ? 0 : sustain), 1)
        
        
        //console.log((1-(i/audiolen)))
        let volume_bits = volume * (1 << bps)
        let sample = getSample(type, i)
        let sample_bits = Math.floor(sample * volume_bits)
        if (sample > 1 || sample <0) {
            throw "Sample out of range: " + sample
        }
        //console.log(sample)
        if (bps == 16) {
            sound[arr_i] = (sample_bits & 0xff) 
            sound[arr_i+1] = Math.floor(sample_bits/256)
            //console.log(sound[arr_i], sound[arr_i+1])
        }
        else {
            sound[arr_i] = sample_bits
        }
    }
    console.log(sound)

    //source.loopStart = (attack+decay < 1 ? (attack+decay)*duration : 0  )
    //source.loopEnd = duration


    function saveFile(fileName,urlFile){
        let a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
        a.href = urlFile;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
    
    let blobData = new Blob([sound], {type: "audio/wav"});
    let url = window.URL.createObjectURL(blobData);
    //let url = "pathExample/localFile.png"; // LocalFileDownload
    //saveFile('test.wav',url);

    audioContext.decodeAudioData(sound.buffer, (v)=>{
        source.buffer = v
        source.connect(audioContext.destination)
        source.loop = true
    })
    document.addEventListener('keydown', function (event) {
        document.getElementById("content").innerHTML += "<div>" + event.code + "<div>"
        if (event.code == "Space" ) {
            
            source.start()
        }
        if (event.code == "KeyL") {
         
        }
        if (event.code == "Enter") {
            source.stop()
        }
    })

    }