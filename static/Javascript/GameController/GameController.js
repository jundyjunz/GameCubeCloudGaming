import { RESTapiHelpers } from "/static/Javascript/Helpers/RESTapiHelpers.js";
import { InteractiveHtmlElementSingleton } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementSingleton.js"; 
import { MultiToggle } from "/static/Javascript/InteractiveHtmlElement/MultiToggle.js";
import { ErrorBar } from "/static/Javascript/InteractiveHtmlElement/ErrorBar.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class GameController{  
    #myGameControllerPacketDispatch;  
    #myInterval; 
    #myController;   
    #myControllerCount; 
    #mySerialConnectionsRoute; 
    #myPostPacketRoute; 

    constructor(aGameControllerDispatch){
        this.#myGameControllerPacketDispatch= aGameControllerDispatch
        this.#myInterval=null;  
        this.#myController=null;
        this.#myControllerCount=0;   
        this.#mySerialConnectionsRoute=null; 
        this.#myPostPacketRoute=null;
    }   
    setSerialConnectionsRoute(aSerialConnectionsRoute){ 
        this.#mySerialConnectionsRoute=aSerialConnectionsRoute; 
        return this; 

    }

    setPostPacketRoute(aPostPacketRoute){ 
        this.#myPostPacketRoute=aPostPacketRoute; 
        return this;
    }

    setInit(aInterval){  
        
        (new BuilderWarning(!this.#mySerialConnectionsRoute)).setRequired(this.setSerialConnectionsRoute).enforce();
        (new BuilderWarning(!this.#myPostPacketRoute)).setRequired(this.setPostPacketRoute).enforce();

        this.#myInterval=aInterval;  
        RESTapiHelpers.RESTGet(this.#mySerialConnectionsRoute,(aData)=>{this.#myControllerCount=aData.count});
        this.#listenForKeyDown(); 
        this.#listenForKeyUp();
        this.#publishPacket(); 
        return this;
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

 
    #publishPacket(){  
        setInterval(()=>{ 
            let thePacket=this.#myGameControllerPacketDispatch.getPacket();
            if(thePacket.length==0)return;
            this.#updateControllerId();  
            let theErrorBar=InteractiveHtmlElementSingleton.getElementByType(ErrorBar);
            if(this.#myController==null) theErrorBar.enableError(`There are currently ${this.#myControllerCount} connected controllers! \n Please select a controller!`); 
            if(this.#myController>=this.#myControllerCount) theErrorBar.enableError(`There are currently ${this.#myControllerCount} connected controllers! \n You are playing on controller #${this.#myController+1} which does not exist!`);
            theErrorBar.disableError();
            this.#postPacket(thePacket); 
            //document.getElementById("PostDebug").textContent=thePacket;
        }, this.#myInterval); 
    } 

    #updateControllerId=()=>{this.#myController = InteractiveHtmlElementSingleton.getElementByType(MultiToggle).getToggleState();}

    #postPacket(aPacket){ 
        if(!this.#myPostPacketRoute) throw new Error("A Route for Posting Serial Data has Not yet Been Initialized! please use setPostPacketRoute() on your GameController Object!");
        RESTapiHelpers.RESTPost(`${this.#myPostPacketRoute}${this.#myController}`, { myData: aPacket }); 
    }
    
}   