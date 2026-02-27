import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class MultiToggle extends InteractiveHtmlElement {   

    #mySwitchButtons; 
    #myIsSetFuncSet;
    constructor(){  
        super();  
        this.#mySwitchButtons=[]
        this.#myIsSetFuncSet=false;

    }    

    setButton(aButton){ 
        this.#mySwitchButtons.push(aButton);
        return this;
    }  

    setFunc(aFunc){ 
         for(let i=0; i< this.#mySwitchButtons.length; i++){ 
            
            let theSwitchButton = this.#mySwitchButtons[i];
            
            theSwitchButton.setButtonWhenSwitchedFalse(()=>{ 
                theSwitchButton.setIsFreezeMouseHoverTrue();
                this.#setAllOtherSwitchButtonColorsOff(theSwitchButton);
                this.#setAllOtherSwitchButtonIsFreezeMouseHoverFalse(theSwitchButton);  
                this.#setAllOtherSwitchButtonStateFalse(theSwitchButton);
                aFunc(i); 
            }); 

            theSwitchButton.setButtonWhenSwitchedTrue(()=>{ 
                theSwitchButton.setToOffColor();  
                theSwitchButton.setIsFreezeMouseHoverFalse();
                aFunc(null);
            });
        }  
        this.#myIsSetFuncSet=true;
        return this;
    }

    setInit(){ //should come last! 
        super.setInit(); 
        (new BuilderWarning(this.#mySwitchButtons==[])).setRequired(this.setButton).enforce("(Make Sure Each SwitchButton Has Called .setInit()!)");
        (new BuilderWarning(this.#myIsSetFuncSet==false)).setRequired(this.setFunc).enforce("(Make Sure You Have Called SetButton Beforehand!)");
        return this;
    }

    #setAllOtherSwitchButtonColorsOff=(aSwitchButton)=>{this.#mySwitchButtons.forEach((aOtherSwitchButton)=>{if (aSwitchButton!=aOtherSwitchButton) aOtherSwitchButton.setToOffColor();});}
    #setAllOtherSwitchButtonIsFreezeMouseHoverFalse=(aSwitchButton)=>{this.#mySwitchButtons.forEach((aOtherSwitchButton)=>{if (aSwitchButton!=aOtherSwitchButton) aOtherSwitchButton.setIsFreezeMouseHoverFalse();});}
    #setAllOtherSwitchButtonStateFalse=(aSwitchButton)=>{this.#mySwitchButtons.forEach((aOtherSwitchButton)=>{if (aSwitchButton!=aOtherSwitchButton) aOtherSwitchButton.setToggleStateFalse();})}
    setLockFalse(){ 
        this.#mySwitchButtons.forEach((aSwitchButton)=>{aSwitchButton.setLockFalse();}); 
        super.setLockFalse();
    } 
    setLockTrue (){ 
        this.#mySwitchButtons.forEach((aSwitchButton)=>{aSwitchButton.setLockTrue();}); 
        super.setLockTrue(); 
    } 

}