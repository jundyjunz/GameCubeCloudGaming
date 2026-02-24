import { InteractiveHtmlElementToggle} from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementToggle.js"; 
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class SwitchButton extends InteractiveHtmlElementToggle{ 
    
    #myPngFalseImagePath;
    #myPngTrueImagePath;
    #myIsSwitchedFalseFunc;
    #myIsSwitchedTrueFunc;
    constructor(aElemID){ 
        
        super(aElemID); 
        this.#myPngFalseImagePath=null;
        this.#myPngTrueImagePath=null;
        this.#myIsSwitchedFalseFunc=false;
        this.#myIsSwitchedTrueFunc=false;
    } 
    
    setInit(){ 
        super.setInit(); 
        (new BuilderWarning(!this.#myPngFalseImagePath))        .setSuggested(this.setButtonWhenSwitchedFalse)  .enforce("(These are Provided as Default Arguments)");
        (new BuilderWarning(!this.#myPngTrueImagePath))         .setSuggested(this.setButtonWhenSwitchedTrue)   .enforce("(These are Provided as Default Arguments)");
        (new BuilderWarning(this.#myIsSwitchedFalseFunc==false)).setSuggested(this.setButtonWhenSwitchedFalse)  .enforce();
        (new BuilderWarning(this.#myIsSwitchedTrueFunc==false)) .setSuggested(this.setButtonWhenSwitchedTrue)   .enforce();
        return this;
    }

    setButtonWhenSwitchedFalse(aFunc, aPngFalseImagePath=null){ 
        this.setClickFuncWhenToggledFalse(()=>{ 
            aFunc();  
            if(!(aPngFalseImagePath && this.myPngElem))  return;
            this.myPngElem.setAttribute("href", aPngFalseImagePath); 
            this.#myPngFalseImagePath=aPngFalseImagePath;
        });
        this.#myIsSwitchedFalseFunc=true;
        return this;        
    }
    setButtonWhenSwitchedTrue(aFunc, aPngTrueImagePath=null){
        this.setClickFuncWhenToggledTrue(()=>{ 
            aFunc(); 
            if(!(aPngTrueImagePath && this.myPngElem))  return;
            this.myPngElem.setAttribute("href", aPngTrueImagePath); 
            this.#myPngTrueImagePath=aPngTrueImagePath;
        }); 
        this.#myIsSwitchedTrueFunc=true;
        return this;
    } 
    setPngElemWhenSwitchedFalse=()=>{this.myPngElem.setAttribute("href", this.#myPngFalseImagePath);}
    setPngElemWhenSwitchedTrue=()=>{this.myPngElem.setAttribute("href", this.#myPngTrueImagePath);}
}
