import { ValidationHelpers } from "/static/Javascript/Helpers/ValidationHelpers.js"
import { GameControllerPacket} from "/static/Javascript/GameController/GameControllerPacket.js"; 
import { CookieHelpers } from "/static/Javascript/Helpers/CookieHelpers.js";
import { Button } from "/static/Javascript/InteractiveHtmlElement/Button.js";
import { InteractiveHtmlElementSingleton } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementSingleton.js"; 
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class GamecubeControllerPacketDispatch{  
    static #mySharedKeyToButtonIdentifier ="Text";
    #myDispatchMap
    #myDispatchCookieName;
    #myDefaultDispatchMap 
    #myBtnCt;
    #myKeyShortenThreshold; 
    #myMouseOutColor; 
    #myMouseOverColor; 
    #myFontFamily;
    #myFontSize;
    #myFontWeight;
    #myOverlayClassName;
    constructor(aDispatchMap){ 
        ValidationHelpers.isMapTypeOf(GameControllerPacket,aDispatchMap) 
        this.#myDispatchCookieName=null;   
        this.#myDefaultDispatchMap=null;
        this.#myKeyShortenThreshold=5;
        this.#myMouseOutColor="gainsboro"; 
        this.#myMouseOverColor="dimgray";
        this.#myFontFamily="tahoma";
        this.#myFontSize=8;
        this.#myFontWeight="bold";
        this.#myOverlayClassName=null;
        this.#myBtnCt=0;
        this.#myDispatchMap=aDispatchMap
        
    }  
    setDispatchCookieName(aDispatchCookieName) { 
        this.#myDispatchCookieName=aDispatchCookieName; 
        return this;
    } 
    setKeyShortenThreshold(aKeyShortenThreshold){ 
        this.#myKeyShortenThreshold=aKeyShortenThreshold;
        return this;
    } 
    setDefaultDispatchMap(aDefaultDispatchMap){ 
        this.#myDefaultDispatchMap=this.#makeCopyOfDispatchMap(aDefaultDispatchMap); 
        return this;
    } 
    setColorOnMouseOut(aColor){ 
        this.#myMouseOutColor=aColor; 
        return this;
    }
    setColorOnMouseOver(aColor){ 
        this.#myMouseOverColor=aColor; 
        return this;
    } 
    setTextSettings(aFontFamily, aFontSize, aFontWeight){ 
        this.#myFontFamily=aFontFamily;
        this.#myFontSize=aFontSize;
        this.#myFontWeight=aFontWeight;
        return this;
    } 
    setOverlayClass(aOverlayClassName){ 
        this.#myOverlayClassName=aOverlayClassName; 
        return this;
    }
    setInit(){ 
        
        (new BuilderWarning(!this.#myOverlayClassName))         .setRequired(this.setOverlayClass)          .enforce();
        (new BuilderWarning(!this.#myDispatchCookieName))       .setRequired(this.setDispatchCookieName)    .enforce();
        (new BuilderWarning(this.#myMouseOutColor=="gainsboro")).setSuggested(this.setColorOnMouseOut)      .enforce();
        (new BuilderWarning(this.#myMouseOverColor=="dimgray")) .setSuggested(this.setColorOnMouseOver)     .enforce();
        (new BuilderWarning(this.#myFontFamily=="tahoma"))      .setSuggested(this.setTextSettings)         .enforce();
        (new BuilderWarning(this.#myFontSize==8))               .setSuggested(this.setTextSettings)         .enforce();
        (new BuilderWarning(this.#myFontWeight=="bold"))        .setSuggested(this.setTextSettings)         .enforce();
        (new BuilderWarning(!this.#myDefaultDispatchMap))       .setSuggested(this.setDefaultDispatchMap)   .enforce();
        (new BuilderWarning(this.#myKeyShortenThreshold==5))    .setSuggested(this.setKeyShortenThreshold)  .enforce();

        this.#importDispatchMap();
        this.#applyEventHandlerToAllKeys(); 
        this.#drawKeyLetters(); 
        return this;
    }

    revertToDefaultDispatchMap(){ 
        if(!(this.#myDispatchCookieName&&this.#myDefaultDispatchMap))return; 
        CookieHelpers.deleteCookie(this.#myDispatchCookieName); 
        this.#myDispatchMap=this.#makeCopyOfDispatchMap(this.#myDefaultDispatchMap);
        this.#drawKeyLetters(); 
    }
    
    get=(aKey)=>this.#myDispatchMap.get(aKey); 

    set(aKey, aValue){ 
        ValidationHelpers.isTypeOf(GameControllerPacket,aValue); 
        this.#myDispatchMap.set(aKey,aValue);
    }  
    has=(aKey)=>this.#myDispatchMap.has(aKey);

    forEach(aFunc){ 
        this.#myDispatchMap.forEach((aValue, aKey)=>{ 
            aFunc(aValue, aKey); 
        });
    }

    setKeyState(aKey, aState){ 
        if(!this.has(aKey))return false; 
        this.get(aKey).setState(aState); 
        return true;
    } 

    setButtonVisibility(aKey, aVisibility){ 
        if(!this.has(aKey))return false;  
        const theValue = this.get(aKey);
        if(!theValue) return false;
        theValue.getButtonElement().style.visibility=aVisibility; 
        return true;
    } 

    getPacket(){ 
        let thePacket=""; 
        this.#myDispatchMap.forEach((aElement, aKey)=>{ 
            if(aElement.getState()) thePacket+=aElement.getSerialData(); 
        }); 
        return thePacket;
    } 

    

    #swapKeyCode(aKey, aOtherKey){ 
        if(!(this.#myDispatchMap.has(aKey) && this.#myDispatchMap.has(aOtherKey))) return false; 

        let theKeyValue = this.get(aKey);  
        let theOtherKeyValue =this.get(aOtherKey); 

        this.#myDispatchMap.set(aKey, theOtherKeyValue);  
        this.#myDispatchMap.set(aOtherKey, theKeyValue); 

        return true;
    }

    #changeKeyCode(aKeyCode, aNewKeyCode){ 
        if(this.#swapKeyCode(aKeyCode, aNewKeyCode)) return; 
        this.#myDispatchMap.set(aNewKeyCode, this.get(aKeyCode)); 
        this.#myDispatchMap.delete(aKeyCode);
    }   

    #findKeyCodeFromKeyElement(aKeyButtonElementID){ 
        let theKey=null;
        this.forEach((aValue, aKey)=>{ 
            if(aValue.getKeyButtonElementID()==aKeyButtonElementID) theKey = aKey;
        });  
        return theKey
    } 
    #applyEventHandlerToKey(aKeyButtonElementID){  
        if(!aKeyButtonElementID) return;
        let theKeyButton =new Button(aKeyButtonElementID);
        theKeyButton.setColorOnMouseOut(this.#myMouseOutColor) 
                    .setColorOnMouseOver(this.#myMouseOverColor) 
                    .setAlias(`KeyButton${this.#myBtnCt++}`)
                    .setTextRectObject( this.#findKeyCodeFromKeyElement(aKeyButtonElementID), this.#myFontFamily, this.#myFontSize, this.#myFontWeight)
                    .setClickFunc(()=>{ 
                        let onKeyDownChangeKeyCode = (aEvent)=>{
                            this.#changeKeyCode(this.#findKeyCodeFromKeyElement(aKeyButtonElementID),aEvent.code); 
                            document.removeEventListener("keydown", onKeyDownChangeKeyCode); 
                            this.#drawKeyLetters(); 
                            theKeyButton.setToOffColor();
                            InteractiveHtmlElementSingleton.setAllLocksFalse();
                            this.#exportDispatchMap();
                        };
                        InteractiveHtmlElementSingleton.setAllLocksTrue();
                        theKeyButton.setToOnColor();
                        document.addEventListener("keydown", onKeyDownChangeKeyCode);
                    }); 
        theKeyButton.myTextElem.setAttribute("visibility", "hidden"); 
        theKeyButton.myTextElem.setAttribute("class",this.#myOverlayClassName); 
        theKeyButton.myTextElem.setAttribute("id", aKeyButtonElementID+GamecubeControllerPacketDispatch.#mySharedKeyToButtonIdentifier);
        InteractiveHtmlElementSingleton.registerElement(theKeyButton);
    }

    #applyEventHandlerToAllKeys(){ 
        this.#myDispatchMap.forEach((aEvent, aKeyCode)=>{ 
            this.#applyEventHandlerToKey(aEvent.getKeyButtonElementID());
        });
    }

    #shortenKeyCodeIfPossible(aKeyCode){ 
        const theThresholdChars = this.#myKeyShortenThreshold;   
        let theNewKeyCode="";
        if (aKeyCode.length<=theThresholdChars) return aKeyCode; 
        for(const aChar of aKeyCode) if(!/[aeiou]/.test(aChar)) theNewKeyCode+=aChar;
        return theNewKeyCode;
    }
    
    #drawKeyLetters(){ 
        this.#myDispatchMap.forEach((aEvent, aKeyCode)=>{   
            document.getElementById(aEvent.getKeyButtonElementID()+GamecubeControllerPacketDispatch.#mySharedKeyToButtonIdentifier).textContent=this.#shortenKeyCodeIfPossible(aKeyCode); 
        });
    }  
    #makeCopyOfDispatchMap=(aDispatchMap)=> this.#convertArrayObjectToDispatchMap(this.#convertDispatchMapToArrayObject(aDispatchMap));

    #convertDispatchMapToArrayObject(aDispatchMap){ 
        return [...aDispatchMap].map((aKeyValuePair) =>{ 
            const theKey= aKeyValuePair[0]; 
            const theValue = aKeyValuePair[1]; 
            const theSerialData= theValue.getSerialData();
            const theButtonID=  theValue.getButtonElementID();
            const theKeyButtonID= theValue.getKeyButtonElementID();
            const theVector= structuredClone(theValue.getVector());  
            let theReturnArray = [theKey, [theSerialData, theButtonID, theKeyButtonID]];
            if(theVector) theReturnArray[1].push(theVector);
            return theReturnArray;
        });   
    } 
    #convertArrayObjectToDispatchMap(aDispatchArray){ 
        return new Map(aDispatchArray.map((aKeyValuePair)=>{ 
            const theKey=aKeyValuePair[0];   
            const theValue=aKeyValuePair[1]; 
            const theSerialData= theValue[0];
            const theButtonID=  theValue[1];
            const theKeyButtonID=theValue[2];
            const theVector= theValue[3];
            let theReturnKeyValuePair= [theKey, new GameControllerPacket(theSerialData, theButtonID).setKeyButtonElement(theKeyButtonID)];  
            if(aKeyValuePair[1].length==4) theReturnKeyValuePair[1].setVector(theVector) 
            return theReturnKeyValuePair;
        }));
    }
    #exportDispatchMap(){  
        //.map expedites the process of converting everything to an array. 
        if (!this.#myDispatchCookieName) return;
        CookieHelpers.putCookie(this.#myDispatchCookieName,this.#convertDispatchMapToArrayObject(this.#myDispatchMap));
    } 

    #importDispatchMap(){ 
        if (!this.#myDispatchCookieName) return;
        let theDispatchArray = CookieHelpers.getCookie(this.#myDispatchCookieName); 
        if(!theDispatchArray) return;
        this.#myDispatchMap=this.#convertArrayObjectToDispatchMap(theDispatchArray);

    }
}