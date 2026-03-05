
export class PacketSingleton{ 
    static #myInstance = null; 
    #myWebSocket;  
    #myControllerNumber;
    #myPacket;
    
    constructor(){  
        if(PacketSingleton.#myInstance){ 
            console.log("Attempted to access PacketSingleton's constructor!");
            return; 
        } 
        this.#myControllerNumber=null;
        this.#myWebSocket=null;
        this.#myPacket=null;
    } 
    static setPacket(aPacket){ 
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        this.#myInstance.#myPacket=aPacket;
    }
    static getPacket(){
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        return this.#myInstance.#myPacket ? this.#myInstance.#myPacket:null;
    }

    static setWebSocket(aWebSocketRoute, aControllerNumber){
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        this.killWebSocket();
        this.#myInstance.myControllerNumber=aControllerNumber;
        this.#myInstance.#myWebSocket = new WebSocket(aWebSocketRoute + `${aControllerNumber}`);  
        this.#myInstance.#myWebSocket.onopen=async()=>{await this.#sendBytesFunc();};
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
        if(this.#myInstance.#myWebSocket)this.#myInstance.#myWebSocket(1000, `Controller #${this.#myInstance.myControllerNumber} Connection Killed`); 
    } 

    static async #sendBytesFunc(){  
        if(!this.#myInstance) this.#myInstance = new PacketSingleton();  
        while(this.#myInstance.#myWebSocket.readyState === WebSocket.OPEN){
            this.#myInstance.#myWebSocket.send(this.getPacket().getBytes());  
            await this.#stall(1) // await required here or microtask queue never finishes
        }
    }

}
