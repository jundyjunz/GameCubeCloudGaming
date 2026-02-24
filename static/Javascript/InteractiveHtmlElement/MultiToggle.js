import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class MultiToggle extends InteractiveHtmlElement {   

    #mySwitchButtons 
    #myCurrentToggleState
    constructor(){  
        super();  
        this.#myCurrentToggleState=null;
        this.#mySwitchButtons=[]
    }    

    setButton(aButton){ 
        this.#mySwitchButtons.push(aButton);
        return this;
    } 

    setInit(){ //should come last! 
        super.setInit(); 
        (new BuilderWarning(this.#mySwitchButtons==[])).setRequired(this.setButton).enforce("(Make Sure Each SwitchButton Has Called .setInit()!)");

        for(let i=0; i< this.#mySwitchButtons.length; i++){ 
            
            let theSwitchButton = this.#mySwitchButtons[i];
            
            theSwitchButton.setButtonWhenSwitchedFalse(()=>{ 
                theSwitchButton.setIsFreezeMouseHoverTrue();
                this.#setAllOtherSwitchButtonColorsOff(theSwitchButton);
                this.#setAllOtherSwitchButtonIsFreezeMouseHoverFalse(theSwitchButton);  
                this.#setAllOtherSwitchButtonStateFalse(theSwitchButton);
                
                this.#myCurrentToggleState=i; 
            }); 

            theSwitchButton.setButtonWhenSwitchedTrue(()=>{ 
                theSwitchButton.setToOffColor();  
                theSwitchButton.setIsFreezeMouseHoverFalse();
                this.#myCurrentToggleState=null;
            });
        } 
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

    getToggleState=()=>this.#myCurrentToggleState;
}