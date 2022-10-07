window.onload = ()=>{
    
    const audioContext = new AudioContext()
    // const oscillator1 = audioContext.createOscillator()    
    // oscillator1.type = "sine"
    const oscillatortypes = ["sine", "square", "sawtooth", "triangle"]
    
    // oscillator1.frequency.setValueAtTime(260, audioContext.currentTime)
    //oscillator1.detune.setValueAtTime(0, audioContext.currentTime)
    
    // oscillator1.start()
    // oscillator1.connect(audioContext.destination)
    window.global = {}
    
    window.global.source = audioContext.createBufferSource()
    const bps = 16
    const samplerate = 44100
    
    window.global.soundcfg = {
        duration: 1,
        bps: bps,
        samplerate: samplerate,
    }    
    
        
    
    let types = ["noise", "sine", "square"]
    
    
    //console.log(sound)
    function generateSound(type, usr_frequency, max_volume, usr_duration) {        
        const duration = usr_duration || 1
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
            
        let volume = 1//between 0 and 1 
        let attack = 0.2//How long to reach peak volume
        let decay = 1 //How long to drop to sustain levels
        let sustain = 0.0
        type = type || "square"
        console.log(type)
        
        const frequency = usr_frequency || 160 
        window.global.soundcfg.frequency = frequency
        window.global.soundcfg.max_volume = max_volume
        window.global.soundcfg.type = type
        window.global.soundcfg.duration = duration

        //DEBUG: 50=50 100 = 300, 200 = 300, 300 = 150
        let release = 0 // TODO: Implement
        
        
        let getSample = (type, index) => {    
            let types = {
                //literally noise
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
            let volume_bits = volume * (1 << bps) * max_volume
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
        return sound
        
        //source.loopStart = (attack+decay < 1 ? (attack+decay)*duration : 0  )
        //source.loopEnd = duration
        //
    }
    
                
    function saveFile(sound, fileName ){
        let blobData = new Blob([sound], {type: "audio/wav"});
        let url = window.URL.createObjectURL(blobData);
    
        let a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
        a.href = urlFile;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
    
    //let url = "pathExample/localFile.png"; // LocalFileDownload
    
    const sound = generateSound(0, 100, 0.03)
    //saveFile(sound, 'test.wav');
            
    function putSoundToSource(sound, source) {
        audioContext.decodeAudioData(sound.buffer, (v)=>{
            source.buffer = v
            source.connect(audioContext.destination)
            source.loop = true
        })
    }

    function restartSound() {
        window.global.source.stop()
        window.global.source.buffer=null
        window.global.source.loop=false
        startSound()
            
    }

    function startSound() {                    
        window.global.source = audioContext.createBufferSource()            
        let source = window.global.source
    
        console.log(source)
        let cfg = window.global.soundcfg
        console.log(cfg)
        let sound = generateSound(cfg.type, cfg.frequency, cfg.max_volume)
        putSoundToSource(sound, source)
        source.start()
    }

    document.addEventListener('keyup', function (event){
        if (!["Arro","Page"].includes(event.code.substring(0,4))){
            window.global.source.stop()
            window.global.source.buffer=null
            window.global.source.loop=false
            window.global.soundcfg.changed = true
        }
    })
    window.global.soundcfg.changed=true

    document.addEventListener('keydown', function (event) {
        let source = window.global.source        
        let cfg = window.global.soundcfg
        
        document.getElementById("content").innerHTML += "<div>" + event.code + "<div>"        

        if (event.code == "Space" ) {
            if (window.global.soundcfg.changed == true) {
                startSound()
                window.global.soundcfg.changed = false
            }
        }
        else {
            window.global.soundcfg.changed = true
        }
        if (event.code == "ArrowRight") {
            let type_index = types.indexOf(window.global.soundcfg.type)
            type_index += 1
            if (type_index == types.length) { type_index=0 }
            window.global.soundcfg.type = types[type_index]                 
        }

        if (event.code == "PageUp") {
            window.global.soundcfg.frequency += 60            
        }
        if (event.code == "PageDown") {
            window.global.soundcfg.frequency -= 60            
        }
                
        if (event.code == "ArrowDown") {
            window.global.soundcfg.max_volume = (cfg.max_volume>0) ? window.global.soundcfg.max_volume -0.01 : 0            
        }

        if (event.code == "ArrowUp") {
            window.global.soundcfg.max_volume = (window.global.soundcfg.max_volume > 0.5) ? 0.5 : window.global.soundcfg.max_volume+0.01            
        }
        
        if (event.code == "Enter") {
            source.stop()            
            console.log(source)
        }
        document.getElementById("cfg").innerText = JSON.stringify(window.global.soundcfg, undefined, 2)    
    })
}
    
            