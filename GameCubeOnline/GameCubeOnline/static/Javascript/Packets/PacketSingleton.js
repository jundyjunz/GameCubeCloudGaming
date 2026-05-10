
export class PacketSingleton{ 
    static #myInstance = null; 
    #myCurrentSocketIndex;
    #myWebSockets;  
    #myPackets;
    
    constructor(){  
        if(PacketSingleton.#myInstance){ 
            console.log("Attempted to access PacketSingleton's constructor!");
            return; 
        } 
        this.#myCurrentSocketIndex = null;
        this.#myWebSockets=[];
        this.#myPackets=[];
    } 
    static setPacket(aPacketType){ 
        if (!this.#myInstance) this.#myInstance = new PacketSingleton();  
        this.#myInstance.#myPackets = Array.from({ length: 3 }, () => new aPacketType()); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
    }

    static getPacket(){
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        return this.#myInstance.#myPackets[this.#myInstance.#myCurrentSocketIndex] ? this.#myInstance.#myPackets[this.#myInstance.#myCurrentSocketIndex] : this.#myInstance.#myPackets[0];
    }

    static setWebSocket(aWebSocketRoute, aPacketIndex){
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        this.killWebSocket(); 
        this.#myInstance.#myCurrentSocketIndex = aPacketIndex;
        this.#myInstance.#myWebSockets[this.#myInstance.#myCurrentSocketIndex] = new WebSocket(aWebSocketRoute);   
        let pee = aWebSocketRoute + `${this.#myInstance.#myCurrentSocketIndex}`;
        this.#myInstance.#myWebSockets[this.#myInstance.#myCurrentSocketIndex].onopen = async () => { await this.#sendBytesFunc(this.#myInstance.#myCurrentSocketIndex);};
    } 
    // aStall cycle is in milliseconds
    // promises hold results of an async function --> microtask queue 
    // stall basically throws a settimeout to the microtask queue.
    // https://www.w3schools.com/jsref/met_win_settimeout.asp --> settimeout allows a function to be executed once the stallcycle has finished. 
    // https://www.w3schools.com/js/js_promise.asp --> (resolve, reject) a function to execute when the resolve is sucessful and reject vice versa.  
    // example:
    // const result = await new Promise(resolve => resolve(5));
    // console.log(result); // 5 
    // --> resolve marks the promise as fulfilled, and stores the value 
    // --> reject marks the promise as unfulfilled and the error reason is storred instead
    /*
       typically do something like this: 
        new Promise((aResolve, aReject)=>{ 
            if(x==0)aResolve(x);  
            else aReject(x);
        }); 

    */
    static async #stall(aStallCycle){await new Promise((aResolve) => setTimeout(aResolve, aStallCycle));}
    static killWebSocket=()=>{ 
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        if (this.#myInstance.#myWebSockets[this.#myInstance.#myCurrentSocketIndex]) this.#myInstance.#myWebSockets[this.#myInstance.#myCurrentSocketIndex].close(1000, `Controller #${this.#myInstance.#myCurrentSocketIndex} Connection Killed`); 
    } 

    static async #sendBytesFunc(){  
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        while (this.#myInstance.#myWebSockets[this.#myInstance.#myCurrentSocketIndex].readyState === WebSocket.OPEN) {
            let leepicpacket = this.getPacket().getBytes();
            this.#myInstance.#myWebSockets[this.#myInstance.#myCurrentSocketIndex].send(leepicpacket);  
            await this.#stall(1) // await required here or microtask queue never finishes
        }
    }

}
