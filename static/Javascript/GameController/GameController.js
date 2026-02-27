import { RESTapiHelpers } from "/static/Javascript/Helpers/RESTapiHelpers.js";
import { InteractiveHtmlElementSingleton } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementSingleton.js"; 
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";


export class GameController{  
    #myGameControllerPacketDispatch;  
    #myController;   
    #myMaxControllerCount; 
    #myWebSocket; 
    #myEncoder;
    #myIsSerialConnectionRouteSet;
    constructor(aGameControllerDispatch){
        this.#myGameControllerPacketDispatch= aGameControllerDispatch
        this.#myController=null;
        this.#myWebSocket=null; 
        this.#myEncoder = new TextEncoder(); 
        this.#myIsSerialConnectionRouteSet=false;
        this.#listenForKeyDown(); 
        this.#listenForKeyUp();
    }      
    setInit(){ 
        (new BuilderWarning(this.#myIsSerialConnectionRouteSet==false)).setRequired(this.setSerialConnectionsRoute).enforce();
        return this;
    }
    setSerialConnectionsRoute=(aSerialConnectionsRoute)=>{ 
        RESTapiHelpers.RESTGet(aSerialConnectionsRoute,(aData)=>{this.#myMaxControllerCount=aData.count});
        this.#myIsSerialConnectionRouteSet=true; 
        return this;
    }
    getMaxControllerCount=()=>this.#myMaxControllerCount;
    
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
    async #stall(aStallCycle){await new Promise((aResolve) => setTimeout(aResolve, aStallCycle));}
    killWebSocket=()=>{if(this.#myWebSocket) this.#myWebSocket.close(1000, `Closed Connection to Controller #${this.#myController}`);} 
    async sendBytesFunc(){  
        while(this.#myWebSocket.readyState === WebSocket.OPEN){
            let thePacket=this.#myGameControllerPacketDispatch.getPacket();
            if(thePacket.length==0){ await this.#stall(8); continue;}
            this.#myWebSocket.send(this.#myEncoder.encode(thePacket));  
            await this.#stall(8) // await required here or microtask queue never finishes
        }
    }
    
    updateWebSocket(aWebSocketRoute){
        this.killWebSocket();
        this.#myWebSocket = new WebSocket(aWebSocketRoute);  
        this.#myWebSocket.onopen=async()=>{await this.sendBytesFunc();};
    }

    #listenForKeyDown(){document.addEventListener("keydown",(aEvent)=>{this.#ListenForKeyPressEvent(aEvent.code, true, "visible");})} 
    #listenForKeyUp(){ document.addEventListener("keyup", (aEvent)=>{this.#ListenForKeyPressEvent(aEvent.code, false, "hidden");})} 

    #ListenForKeyPressEvent(aKey, aState, aVisibility){  
         // toggles keystate 
         // also toggles visbility of element 
         // also calculates control stick movement 
         // skips the function if there is asubscriber lock due to a key change 
        if(InteractiveHtmlElementSingleton.getLockStateAll())return;
        this.#myGameControllerPacketDispatch.setKeyState(aKey, aState);  
        this.#myGameControllerPacketDispatch.setButtonVisibility(aKey, aVisibility);
        if(this.#myGameControllerPacketDispatch.has(aKey) && this.#myGameControllerPacketDispatch.get(aKey).getVector()) this.#drawControlStick(aKey, aState);
  
    } 
    #drawControlStick(aKey, aState){  
        //control sticks require data-max-c_ attributes to properly determine where a control stick should go.
       if(!this.#myGameControllerPacketDispatch.has(aKey))return;  
        let theKeyState =this.#myGameControllerPacketDispatch.get(aKey);
        let theKeyStateElement=theKeyState.getButtonElement();
        const theModifier = aState ? 1:-1;
        const theXCoord=Number(theKeyStateElement.getAttribute("cx"));  
        const theYCoord =Number(theKeyStateElement.getAttribute("cy"));   
        const theMaxXCoord = Number(theKeyStateElement.getAttribute("data-max-cx"));
        const theMaxYCoord = Number(theKeyStateElement.getAttribute("data-max-cy"));
        const theMinXCoord = Number(theKeyStateElement.getAttribute("data-min-cx"));
        const theMinYCoord = Number(theKeyStateElement.getAttribute("data-min-cy")); 

        let theNewXCoord = theXCoord+theKeyState.getVector()[0]*((theMaxXCoord-theMinXCoord)/2)*theModifier;
        let theNewYCoord = theYCoord+theKeyState.getVector()[1]*((theMaxYCoord-theMinYCoord)/2)*theModifier;
        if(theNewXCoord<=theMaxXCoord && theNewXCoord>= theMinXCoord)theKeyStateElement.setAttribute("cx", theNewXCoord ); 
        if(theNewYCoord<=theMaxYCoord && theNewYCoord>= theMinYCoord)theKeyStateElement.setAttribute("cy", theNewYCoord); 
    }
  
}   