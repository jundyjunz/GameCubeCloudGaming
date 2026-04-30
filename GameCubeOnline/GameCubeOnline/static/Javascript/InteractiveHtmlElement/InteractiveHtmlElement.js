import { InteractiveHtmlElementSingleton } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementSingleton.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class InteractiveHtmlElement{ 
    myMainElem;  
    myOnColor;
    myOffColor; 
    myTextElem; 
    myPngElem; 
    myIsFreezeMouseHover;
    #mySubscriberLock; 
    #myAlias;  
    #myFunc;
    #myExtraData;
    #myMouseOverFunc;
    #myMouseOutFunc;

    constructor(aMainElemID=null){ 
        if(aMainElemID) this.myMainElem=document.getElementById(aMainElemID);
        this.#mySubscriberLock=false; 
        this.myOnColor=null;
        this.myOffColor=null; 
        this.#myAlias=null;   
        this.myTextElem=null;
        this.myPngElem=null; 
        this.#myFunc=null;
        this.#myExtraData=null
        this.#myMouseOverFunc=null;
        this.#myMouseOutFunc=null;

    } 
    setInit(){ 
        (new BuilderWarning(!this.#myAlias))    .setSuggested(this.setAlias)            .enforce(); 
        (new BuilderWarning(!this.myTextElem))  .setSuggested(this.setTextRectObject)   .enforce(); 
        (new BuilderWarning(!this.myPngElem))   .setSuggested(this.setPngElem)          .enforce();
        (new BuilderWarning(!this.myOffColor))  .setSuggested(this.setColorOnMouseOut)  .enforce();
        (new BuilderWarning(!this.myOnColor))   .setSuggested(this.setColorOnMouseOver) .enforce();
        (new BuilderWarning(!this.#myFunc))     .setSuggested(this.setClickFunc)        .enforce();
        (new BuilderWarning(!this.#myExtraData)).setSuggested(this.setExtraData)        .enforce();
        return this;
    } 
    setExtraData=(aExtraData)=>{ 
        this.#myExtraData=aExtraData; 
        return this;
    }
    
    setPngElem(aPngElemID){ 
        this.myPngElem=document.getElementById(aPngElemID); 
        return this;
    }
    setColorOnMouseOut(aMouseOutColor){   
        this.myOffColor=aMouseOutColor; 
        this.#myMouseOutFunc=(aEvent)=>{ if (!this.myIsFreezeMouseHover) this.#fillMainElementIfNotLocked(aMouseOutColor);};
        this.myMainElem.addEventListener("mouseout", this.#myMouseOutFunc);  
        if(this.myPngElem) this.myPngElem.addEventListener("mouseout", this.#myMouseOutFunc); 
        if(this.myTextElem) this.myTextElem.addEventListener("mouseout", this.#myMouseOutFunc);
        return this;
    } 
    setColorOnMouseOver(aMouseOverColor){  
        this.myOnColor=aMouseOverColor; 
        this.#myMouseOverFunc=(aEvent)=>{ if (!this.myIsFreezeMouseHover) this.#fillMainElementIfNotLocked(aMouseOverColor);};
        this.myMainElem.addEventListener("mouseover",this.#myMouseOverFunc); 
        if(this.myPngElem) this.myPngElem.addEventListener("mouseover", this.#myMouseOverFunc);
        if(this.myTextElem) this.myTextElem.addEventListener("mouseover", this.#myMouseOverFunc);

        return this;
    } 
    

    setAlias(aAlias){ 
        this.#myAlias=aAlias;
        return this;
    }  
    setClickFunc(aFunc){   
        this.#myFunc=(aEvent)=>{ this.#executeFuncIfNotLocked( aFunc);};
        this.myMainElem.addEventListener("click",  this.#myFunc); 
        if(this.myPngElem) this.myPngElem.addEventListener("click", this.#myFunc);
        if(this.myTextElem) this.myTextElem.addEventListener("click", this.#myFunc);
        return this;
    }  
    setTextRectObject(aText, aFontFamily, aFontSize, aFontWeight, aCenter=false, aClass= null, aVisibility=null){ 
        this.myTextElem = document.createElementNS("http://www.w3.org/2000/svg", "text");  
        this.myTextElem.textContent=aText;
        this.myTextElem.setAttribute("font-family", aFontFamily); 
        this.myTextElem.setAttribute("font-size", aFontSize); 
        this.myTextElem.setAttribute("font-weight", aFontWeight);   
        if(aClass) this.myTextElem.setAttribute("class", aClass); 
        if(aVisibility) this.myTextElem.setAttribute("visibility",aVisibility); 

        let theMainElemHeight= (Number)(this.myMainElem.getAttribute("height"));
        let theMainElemWidth= (Number)(this.myMainElem.getAttribute("width")); 
        let theMainElemYVal=(Number)(this.myMainElem.getAttribute("y"));
        let theMainElemXVal=(Number)(this.myMainElem.getAttribute("x"));

        if(aCenter) this.myTextElem.setAttribute("x",theMainElemXVal+theMainElemWidth/2-aText.length*3.5);
        else this.myTextElem.setAttribute("x",theMainElemXVal+aFontSize/3.5);
        this.myTextElem.setAttribute("y",(theMainElemHeight/2+theMainElemYVal+aFontSize/2.75));

        this.myMainElem.parentNode.appendChild(this.myTextElem);
        return this;
    } 

    destroyTextElem=()=>{ if(this.myTextElem) this.myTextElem.parentNode.removeChild(this.myTextElem);}
    destroyClickFunc=()=>{  
        if(this.#myFunc) this.myMainElem.removeEventListener("click", this.#myFunc); 
        if(this.myPngElem) this.myPngElem.removeEventListener("click", this.#myFunc);
        if(this.myTextElem) this.myTextElem.removeEventListener("click", this.#myFunc);
    } 
    destroyMouseOverFunc(){ 
        if(this.#myMouseOverFunc) this.myMainElem.removeEventListener("mouseover",this.#myMouseOverFunc);
        if(this.myPngElem) this.myPngElem.removeEventListener("mouseover", this.#myMouseOverFunc);
        if(this.myTextElem) this.myTextElem.removeEventListener("mouseover", this.#myMouseOverFunc);
    }
    destroyMouseOutFunc(){ 
        if(this.#myMouseOutFunc) this.myMainElem.removeEventListener("mouseout",this.#myMouseOutFunc);
        if(this.myPngElem) this.myPngElem.removeEventListener("mouseout", this.#myMouseOutFunc);
        if(this.myTextElem) this.myTextElem.removeEventListener("mouseout", this.#myMouseOutFunc);
    } 

    destroy(){ 
        this.destroyTextElem();
        this.destroyClickFunc();
        this.destroyMouseOverFunc();
        this.destroyMouseOutFunc();
    }

    setNewText=(aText)=>{if(this.myTextElem) this.myTextElem.textContent=aText;}
    setToOnColor=()=>{this.myMainElem.setAttribute("fill", this.myOnColor);}
    setToOffColor=()=>{this.myMainElem.setAttribute("fill", this.myOffColor);}
    setLockFalse=()=>{this.#mySubscriberLock=false;}
    setLockTrue=()=>{this.#mySubscriberLock=true;} 
    setIsFreezeMouseHoverFalse=()=>{this.myIsFreezeMouseHover=false;}
    setIsFreezeMouseHoverTrue=()=>{this.myIsFreezeMouseHover=true;}

    getLockState=()=>this.#mySubscriberLock;  
    getExtraData=()=>this.#myExtraData;
    getAlias=()=>this.#myAlias;
    getClickFunc=()=>this.#myFunc; 
    getOnColor=()=>this.myOnColor; 
    getOffColor=()=>this.myOffColor; 
    getTextElem=()=>this.myTextElem;

    #executeFuncIfNotLocked=(aFunc)=>{if(!this.getLockState())aFunc();}
    #fillMainElementIfNotLocked=(aColor)=>{ if(!this.getLockState()) this.myMainElem.setAttribute("fill", aColor);} 
}  
