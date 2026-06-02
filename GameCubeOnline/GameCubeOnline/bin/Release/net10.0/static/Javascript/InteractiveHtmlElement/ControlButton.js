import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class ControlButton extends InteractiveHtmlElement{ 

    #myControlElem; 
    #myVector; 
    #myKeyCode;
    #myKeyEventFunc;
    
    constructor(aElemId){ 
        super(aElemId); 
        this.#myControlElem=null  
        this.#myVector=null; 
        this.#myKeyCode=null; 
        this.#myKeyEventFunc=null;

    
        
    }  

    setInit(){ 
        (new BuilderWarning(!this.#myControlElem)).setRequired(this.setControlElem).enforce("(This Must Be Set First!)");
        (new BuilderWarning(!this.#myVector)).setSuggested(this.setVector).enforce();
        (new BuilderWarning(!this.#myKeyCode)).setSuggested(this.setKeyEventListeners).enforce();
        (new BuilderWarning(!this.#myKeyEventFunc)).setSuggested(this.setKeyEventListeners).enforce();

     

        return this;
    }  

    destroyKeyEventListeners(){ 
        document.removeEventListener("keydown", this.#keyDownEventListener);
        document.removeEventListener("keyup", this.#keyUpEventListener);  
    }
    destroy(){ 
        super.destroy(); 
        this.destroyKeyEventListeners();
    }

    setKeyEventListeners(aKeyCode, aKeyEventFunc){   
        this.#removeKeyEventListeners();
        this.#myKeyCode=aKeyCode; 
        this.#myKeyEventFunc=aKeyEventFunc;
        document.addEventListener("keydown", this.#keyDownEventListener);
        document.addEventListener("keyup", this.#keyUpEventListener);  
        return this;
    }

    setVector(aVector){ 
        this.#myVector=aVector; 
        return this;
    }

    setControlElem(aControlElemId, aDefaultVisibility){ 
        this.#myControlElem=document.getElementById(aControlElemId); 
        this.#myControlElem.setAttribute("visibility", aDefaultVisibility);
        return this;
    } 

   

    #eventListener(aEvent, aState){  
        if(this.getLockState()) return;
        if(aEvent.code!=this.#myKeyCode)return;
        this.#myKeyEventFunc(aState);
        this.#enableControlButton(aState); 
        if(this.#isControlStick()) this.#enableControlStick(aState);
    }

    #removeKeyEventListeners(){ 
        this.#myKeyCode=null
        this.#myKeyEventFunc=null;
        document.removeEventListener("keydown", this.#keyDownEventListener); 
        document.removeEventListener("keyup", this.#keyUpEventListener);
    }
    getKeyEventFunc=()=> this.#myKeyEventFunc;
    getKeyCode=()=>this.#myKeyCode; 
    getElemID=()=>this.myMainElem.getAttribute("id");
    getVector=()=>this.#myVector;
    getControlElemID=()=>this.#myControlElem.getAttribute("id");
    #keyDownEventListener=(aEvent)=>{this.#eventListener(aEvent, true);}

    #keyUpEventListener=(aEvent)=>{this.#eventListener(aEvent,false);}

    #enableControlButton=(aState)=>{ this.#myControlElem.setAttribute("visibility", aState ? "visible":"hidden" );}

    #enableControlStick(aState){  
        //control sticks require data-max-c_ attributes to properly determine where a control stick should go.
        const theModifier = aState ? 1:-1;
        const theXCoord=Number(this.#myControlElem.getAttribute("cx"));  
        const theYCoord =Number(this.#myControlElem.getAttribute("cy"));   
        const theMaxXCoord = Number(this.#myControlElem.getAttribute("data-max-cx"));
        const theMaxYCoord = Number(this.#myControlElem.getAttribute("data-max-cy"));
        const theMinXCoord = Number(this.#myControlElem.getAttribute("data-min-cx"));
        const theMinYCoord = Number(this.#myControlElem.getAttribute("data-min-cy")); 

        let theNewXCoord = theXCoord+this.#myVector[0]*((theMaxXCoord-theMinXCoord)/2)*theModifier;
        let theNewYCoord = theYCoord+this.#myVector[1]*((theMaxYCoord-theMinYCoord)/2)*theModifier;
        if(theNewXCoord<=theMaxXCoord && theNewXCoord>= theMinXCoord)this.#myControlElem.setAttribute("cx", theNewXCoord ); 
        if(theNewYCoord<=theMaxYCoord && theNewYCoord>= theMinYCoord)this.#myControlElem.setAttribute("cy", theNewYCoord); 
    } 
    #isControlStick=()=> this.#myVector!=null;
}