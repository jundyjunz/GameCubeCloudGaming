import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class InteractiveHtmlElementToggle extends InteractiveHtmlElement{ 
    #myToggleState; 
    #myFuncHandleWhenToggledFalse; 
    #myFuncHandleWhenToggledTrue;
    constructor(aElementID){ 
        super(aElementID); 
        this.#myFuncHandleWhenToggledFalse=null; 
        this.#myFuncHandleWhenToggledTrue=null;
        this.myToggleState = false;
    } 
    
    setClickFuncWhenToggledFalse(aFunc){  
        this.#myFuncHandleWhenToggledFalse=aFunc;
        return this;
    } 
    setClickFuncWhenToggledTrue(aFunc){  
        this.#myFuncHandleWhenToggledTrue=aFunc;
        return this; 
    } 
    setInit(){
        super.setInit();
        (new BuilderWarning(!this.#myFuncHandleWhenToggledFalse))   .setSuggested(this.setClickFuncWhenToggledFalse)    .enforce("(Feel Free to Just Enter In an Empty Function)"); 
        (new BuilderWarning(!this.myFuncHandleWhenToggledTrue))     .setSuggested(this.setClickFuncWhenToggledTrue)     .enforce("(Feel Free to Just Enter In an Empty Function)"); 

        this.setClickFunc(()=>{ 
            if(!this.#myToggleState) this.#myFuncHandleWhenToggledFalse();
            else this.#myFuncHandleWhenToggledTrue();
            this.#myToggleState=!this.#myToggleState; 

        });  
        return this;
    }
    setToggleStateFalse=()=>{this.#myToggleState=false;}
    setToggleStateTrue=()=>{this.#myToggleState=true;}
}