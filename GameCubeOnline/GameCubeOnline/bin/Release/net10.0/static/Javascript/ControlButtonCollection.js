import { InteractiveHtmlElementSingleton } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementSingleton.js"; 
import { PacketSingleton } from "/static/Javascript/Packets/PacketSingleton.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";
import { CookieHelpers } from "/static/Javascript/Helpers/CookieHelpers.js";
import { ControlButton } from "/static/Javascript/InteractiveHtmlElement/ControlButton.js";
export class ControlButtonCollection{ 

    #myControlButtonCookieName;
    #myDefaultInstructions;
    #myKeyShortenThreshold
    constructor(){ 
        this.#myControlButtonCookieName = null; 
        this.#myDefaultInstructions=null;
        this.#myKeyShortenThreshold =null;
    } 


    setInit(aControlButtonInstructions){ 
        (new BuilderWarning(!this.#myDefaultInstructions)).setRequired(this.setDefaultInstructions).enforce();
        (new BuilderWarning(!this.#myControlButtonCookieName)).setRequired(this.setCookieName).enforce();
        (new BuilderWarning(!this.#myKeyShortenThreshold)).setSuggested(this.setKeyShortenThreshold).enforce();
        if(!this.#importDispatchMap()) this.#theMassControlButtonAssembler(aControlButtonInstructions);

        return this;
    } 
    setKeyShortenThreshold(aThreshold){ 
        this.#myKeyShortenThreshold=aThreshold;
        return this;
    }

    setCookieName(aCookieName){ 
        this.#myControlButtonCookieName=aCookieName; 
        return this;
    } 

    setDefaultInstructions(aInstructions){ 
        this.#myDefaultInstructions=structuredClone(aInstructions); 
        return this;
    }

    resetToDefaultControlButtons(){ 
        InteractiveHtmlElementSingleton.forEach((aControlButton)=>{ aControlButton.destroy();},ControlButton); 
        InteractiveHtmlElementSingleton.unregisterManyElements(ControlButton);  
        this.#theMassControlButtonAssembler(this.#myDefaultInstructions);
        CookieHelpers.deleteCookie(this.#myControlButtonCookieName);
    }

    #SwapControlButtons(aButtonA, aButtonB){ 

        let theButtonBKeyFunc = aButtonB.getKeyEventFunc()  
        let theButtonBKeyCode = aButtonB.getKeyCode(); 

        let theButtonAKeyFunc =aButtonA.getKeyEventFunc(); 
        let theButtonAKeyCode = aButtonA.getKeyCode();

        aButtonA.setAlias(theButtonBKeyCode) 
        .setKeyEventListeners(theButtonBKeyCode, theButtonBKeyFunc) 
        .setNewText(this.#shortenKeyCodeIfPossible(theButtonBKeyCode))

        aButtonB.setAlias(theButtonAKeyCode)
        .setKeyEventListeners(theButtonAKeyCode, theButtonAKeyFunc)
        .setNewText(this.#shortenKeyCodeIfPossible(theButtonAKeyCode))
    }


    #getControlButtonByKeyCode(aKeyCode){
        let theButtonElem=null; 
        InteractiveHtmlElementSingleton.forEach((aButton)=>{  if(aButton.getKeyCode()==aKeyCode) theButtonElem=aButton;},ControlButton); 
        return theButtonElem;
    }

    #ChangeControlButtons(aCurrentButton, aKeyCode){ 
        let theButtonA=aCurrentButton;
        let theButtonB=this.#getControlButtonByKeyCode(aKeyCode);
        if(!theButtonB) theButtonA.setKeyEventListeners(aKeyCode, theButtonA.getKeyEventFunc()).setNewText(aKeyCode) ;
        else this.#SwapControlButtons(theButtonA, theButtonB);
        theButtonA.setToOffColor();
    }
    
    #ControlButtonHandler(aButtonElementID){ 
        let theCurrentButton = InteractiveHtmlElementSingleton.getElement(aButtonElementID);
        let theOnKeyDownChangeButtons =(aEvent)=>{
            theCurrentButton.setToOffColor();
            this.#ChangeControlButtons(theCurrentButton, aEvent.code);
            document.removeEventListener("keydown", theOnKeyDownChangeButtons); 
            InteractiveHtmlElementSingleton.setAllLocksFalse();
            this.#exportDispatchMap();
        };
        InteractiveHtmlElementSingleton.setAllLocksTrue();
        theCurrentButton.setToOnColor();
        document.addEventListener("keydown", theOnKeyDownChangeButtons); 
    } 

    #shortenKeyCodeIfPossible(aKeyCode){ 
        const theThresholdChars = this.#myKeyShortenThreshold;   
        let theNewKeyCode="";
        if (aKeyCode.length<=theThresholdChars) return aKeyCode; 
        for(const aChar of aKeyCode) if(!/[aeiou]/.test(aChar)) theNewKeyCode+=aChar;
        return theNewKeyCode;
    }
    
    
    #ControlButtonAssembler=(aButtonElementID, aControlElementID, aKeyCode, aFuncStr, aVector=null, aMouseOutColor="gainsboro", aMouseOverColor="dimgray")=>{ 
        let theTextVisibility = document.getElementById(aButtonElementID).getAttribute("visibility");
        return InteractiveHtmlElementSingleton.registerElement( 
            (new ControlButton(aButtonElementID))
            .setColorOnMouseOut(aMouseOutColor) 
            .setColorOnMouseOver(aMouseOverColor)  
            .setClickFunc(()=>{this.#ControlButtonHandler(aButtonElementID);})
            .setControlElem(aControlElementID, "hidden")
            .setVector(aVector) 
            .setKeyEventListeners(aKeyCode, PacketSingleton.getPacket().getSetter(aFuncStr))  
            .setTextRectObject(this.#shortenKeyCodeIfPossible(aKeyCode),"tahoma", 8, "bold", false, "overlay",theTextVisibility)
            .setAlias(aButtonElementID) 
            .setExtraData(aFuncStr)
            .setInit()
        )
    }
    
    #theMassControlButtonAssembler=(aInstructions)=>{ aInstructions.forEach((aInstruction)=>{ this.#ControlButtonAssembler(...aInstruction); });}
    
    #getCurrentControlButtonInstructions(){ 
        let theControlButtonInstructions=[]; 
        InteractiveHtmlElementSingleton.forEach((aControlButton)=>{theControlButtonInstructions.push([ aControlButton.getElemID(), aControlButton.getControlElemID(), aControlButton.getKeyCode(), aControlButton.getExtraData(), aControlButton.getVector()]); }, ControlButton); 
        return theControlButtonInstructions;
    }

    #exportDispatchMap(){  
        if (!this.#myControlButtonCookieName) return false;
        CookieHelpers.putCookie(this.#myControlButtonCookieName, this.#getCurrentControlButtonInstructions()); 
        return true;
    } 
    
    #importDispatchMap(){ 
        if (!this.#myControlButtonCookieName) return false;
        let theControlButtonInstructions = CookieHelpers.getCookie(this.#myControlButtonCookieName); 
        if(!theControlButtonInstructions) return false;
        this.#theMassControlButtonAssembler(theControlButtonInstructions); 
        return true;
    }
}