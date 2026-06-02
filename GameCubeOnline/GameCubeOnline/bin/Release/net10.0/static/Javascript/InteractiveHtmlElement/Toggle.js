import { InteractiveHtmlElementToggle } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementToggle.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class Toggle extends InteractiveHtmlElementToggle{ 

    #myRectElem; 
    #myIsSwitchedFalseFunc;
    #myIsSwitchedTrueFunc;
    constructor(aElemID){  
        super(aElemID);
        this.#myRectElem=null;
        this.#myIsSwitchedFalseFunc=false;
        this.#myIsSwitchedTrueFunc=false;
    }   

    setInit(){ 
        super.setInit(); 
        (new BuilderWarning(!this.#myRectElem))                 .setSuggested(this.setRectElem)                 .enforce();
        (new BuilderWarning(this.#myIsSwitchedFalseFunc==false)).setSuggested(this.setTogglePosWhenToggledFalse).enforce();
        (new BuilderWarning(this.#myIsSwitchedTrueFunc==false)) .setSuggested(this.setTogglePosWhenToggledTrue) .enforce();
        return this;
    }

    setRectElem(aRectID){ 
        this.#myRectElem=document.getElementById(aRectID); 
        return this;
    } 

    setTogglePosWhenToggledFalse(aCxPos, aRectColorWhenToggledFalse=null, aFunc=null){ 
        this.setClickFuncWhenToggledFalse(()=>{ 
            this.myMainElem.setAttribute("cx", aCxPos); 
            this.#myRectElem.setAttribute("fill", aRectColorWhenToggledFalse); 
            if(aFunc)aFunc();
        });  
        this.#myIsSwitchedFalseFunc=true;
        return this;
    } 

    setTogglePosWhenToggledTrue(aCxPos, aRectColorWhenToggledTrue=null, aFunc=null){
        this.setClickFuncWhenToggledTrue(()=>{ 
            this.myMainElem.setAttribute("cx", aCxPos); 
            this.#myRectElem.setAttribute("fill", aRectColorWhenToggledTrue);
            if(aFunc)aFunc();
        }); 
        this.#myIsSwitchedTrueFunc=true;
        return this;
    }
}
