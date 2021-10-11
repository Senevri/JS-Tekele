Memory = (function(){
    
    class Memory extends Uint8Array {
        pointer = 0

        push(uint8) {
            this[this.pointer] = uint8
            this.pointer++
        }

        append(arr){
            //println(arr)
            arr.forEach((e)=>{
                if (e>0xff){ // big endian
                    this.push(e >> 8)
                    this.push(e & 0xff)
                } else {
                    this.push(e)
                }
                let p=this.pointer-1
            })
        }
        
        step(){
            return this[this.pointer++]
        }

        w_step(){
            var word = this.step() << 8
            word += this.step()
            return word
        }

        write(address, arr) {
            arr.forEach((e, i)=> {
                this[address+i] = e
            })
        }
    };
    return Memory
})()