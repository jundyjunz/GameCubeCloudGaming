export class Packet{ 
    static myPolyNomialEncoder = 0xFA;
    #myPacket;
    #mySetterDispatch;
    constructor(){ 
        this.#myPacket = [
            [1,1,1,1, 1,0,1,0], // 0xFA
            [0,0,0,0, 0,0,0,0], // a-1:0,        b-1:1,           x-1:2,          y-1:3,          dup-1:4,        ddown-1:5,      dleft-1:6,  dright-1:7
            [0,0,0,0, 0,0,0,0], // start-2:0,    ltrigger-2:1,    rtrigger-2:2,   cup-2:3,        cdown-2:4,      cleft-2:5,      cright-2:6, up-2:7
            [0,0,0,0, 0,0,0,0], // down-3:0,     left-3:1,        right-3:2,      ztrigger-3:3,   UNUSED-3:4,     UNUSED-3:5,     UNUSED-3:6, UNUSED-3:7
        ] 
        this.#mySetterDispatch= new Map([ 
            ["a",          (aState)=> {this.#myPacket[1][0]=aState?1:0;}], 
            ["b",          (aState)=> {this.#myPacket[1][1]=aState?1:0;}],
            ["x",          (aState)=> {this.#myPacket[1][2]=aState?1:0;}], 
            ["y",          (aState)=> {this.#myPacket[1][3]=aState?1:0;}],
            ["dup",        (aState)=> {this.#myPacket[1][4]=aState?1:0;}], 
            ["ddown",      (aState)=> {this.#myPacket[1][5]=aState?1:0;}],
            ["dleft",      (aState)=> {this.#myPacket[1][6]=aState?1:0;}], 
            ["dright",     (aState)=> {this.#myPacket[1][7]=aState?1:0;}],
            ["start",      (aState)=> {this.#myPacket[2][0]=aState?1:0;}], 
            ["ltrigger",   (aState)=> {this.#myPacket[2][1]=aState?1:0;}],
            ["rtrigger",   (aState)=> {this.#myPacket[2][2]=aState?1:0;}], 
            ["cup",        (aState)=> {this.#myPacket[2][3]=aState?1:0;}],
            ["cdown",      (aState)=> {this.#myPacket[2][4]=aState?1:0;}], 
            ["cleft",      (aState)=> {this.#myPacket[2][5]=aState?1:0;}],
            ["cright",     (aState)=> {this.#myPacket[2][6]=aState?1:0;}], 
            ["up",         (aState)=> {this.#myPacket[2][7]=aState?1:0;}],
            ["down",       (aState)=> {this.#myPacket[3][0]=aState?1:0;}], 
            ["left",       (aState)=> {this.#myPacket[3][1]=aState?1:0;}],
            ["right",      (aState)=> {this.#myPacket[3][2]=aState?1:0;}], 
            ["ztrigger",   (aState)=> {this.#myPacket[3][3]=aState?1:0;}]
        ]);
    }

    getSetter=(aSetStr)=>this.#mySetterDispatch.get(aSetStr)

    //https://www.sunshine2k.de/articles/coding/crc/understanding_crc.html 
    //https://www.luisllamas.es/en/arduino-checksum/ 
    //https://github.com/PowerBroker2/SerialTransfer 
    #crc8(){ 
        let theEvolvingCRC = 0x00;  

        [...this.#myPacket].forEach((aByte)=>{ 
            [...aByte].reverse().forEach((aBit)=>{ // we reverse because we need to operate on the LSB just like in the C code.
                let theAreLSBBitsDifferent = (aBit^theEvolvingCRC)&1; 
                theEvolvingCRC>>=1; 
                if(theAreLSBBitsDifferent) theEvolvingCRC^=Packet.myPolyNomialEncoder; 
            })
        });

        return theEvolvingCRC & 0xFF 
    }


    #convertToBytes(){ 
        let theBytes=[];
        this.#myPacket.forEach((aByte)=>{ 
            let theByte=0x00; 
            let theIteration=0;
            [...aByte].reverse().forEach((aBit)=>{ 
                if(aBit==1) theByte |= (1<<theIteration) 
                theIteration++;
            }); 
            theBytes.push(theByte & 0xFF);
        })
        return theBytes
    }
    
    //https://stackoverflow.com/questions/57116503/javascript-overriden-methods-defined-as-arrow-functions-are-not-seen-in-parent
    //If you plan on having your child class override this method, DO NOT MAKE IT AN ARROW FUNCTION!!
    getBytes(){  
        return new Uint8Array([...this.#convertToBytes(), this.#crc8()]); 
    }


    isDefault=()=>[...this.#myPacket[1], ...this.#myPacket[2], ...this.#myPacket[3]].every((aBit)=>aBit===0);
    
  
}