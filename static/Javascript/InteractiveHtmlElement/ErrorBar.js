import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class ErrorBar extends InteractiveHtmlElement{  
    #myFontFamily 
    #myFontSize 
    #myFontWeight 
    #myIsTextCentered;
    constructor(aElemID){   
        super(aElemID);  
        this.#myFontFamily=null;
        this.#myFontSize=null; 
        this.#myFontWeight=null; 
        this.#myIsTextCentered=null;
        this.setClickFunc(()=>{this.disableError();});
    }  

    setInit(){ 
        super.setInit(); 
        (new BuilderWarning(!this.#myFontFamily))       .setRequired(this.setTextSettings).enforce(); 
        (new BuilderWarning(!this.#myFontSize))         .setRequired(this.setTextSettings).enforce(); 
        (new BuilderWarning(!this.#myFontWeight))       .setRequired(this.setTextSettings).enforce(); 
        (new BuilderWarning(!this.#myIsTextCentered))   .setRequired(this.setTextSettings).enforce();
        return this;
    }
    setTextSettings( aFontFamily, aFontSize, aFontWeight, aCenter){ 
        this.#myFontFamily=aFontFamily;
        this.#myFontSize=aFontSize; 
        this.#myFontWeight=aFontWeight;  
        this.#myIsTextCentered=aCenter;
        return this;
    }
    enableError(aText){ 
        if(this.myTextElem) this.myTextElem.remove();  
        this.setTextRectObject(aText, this.#myFontFamily, this.#myFontSize, this.#myFontWeight, this.#myIsTextCentered);
        this.myMainElem.setAttribute("visibility", "visible"); 
        throw new Error(aText);
    } 
    disableError(){ 
        if(this.myTextElem) this.myTextElem.remove();  
        this.myMainElem.setAttribute("visibility", "hidden");
    }
}