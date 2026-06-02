import { Packet } from "/static/Javascript/Packets/Packet.js";

export class GameCubePacket extends Packet{ 
    #myTextEncoder;
    constructor(){ 
        super(); 
        this.#myTextEncoder=new TextEncoder();
    } 
    getBytes(){ 

        let thePacket=""; 
        let theByteArray = super.getBytes();
        let theBytesToCommands = new Map([ 
            [theByteArray[1], ['a','b','x','y','1','2','3','4']], 
            [theByteArray[2], ['s','l','r','5','6','7','8','U']],
            [theByteArray[3], ['D','L','R','z', '', '', '', '']]
        ]);
        
        theBytesToCommands.forEach((aCommands, aBytes)=>{  
            for(let i=0; i<8; i++){ 
                let theIsCommandTrue = (aBytes>>i) & 0x01 == 1; 
                let theCommandIndex = aCommands.length-(i+1);
                if (theIsCommandTrue) thePacket+=aCommands[theCommandIndex];
            } 
        });

        return this.#myTextEncoder.encode(thePacket);  
    }
}