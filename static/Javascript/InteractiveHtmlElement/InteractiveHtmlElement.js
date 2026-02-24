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
    constructor(aMainElemID=null){ 
        if(aMainElemID) this.myMainElem=document.getElementById(aMainElemID);
        this.#mySubscriberLock=false; 
        this.myOnColor=null;
        this.myOffColor=null; 
        this.#myAlias=null;   
        this.myTextElem=null;
        this.myPngElem=null; 
        this.#myFunc=null;

    } 
    setInit(){ 
        (new BuilderWarning(!this.#myAlias))    .setSuggested(this.setAlias)            .enforce(); 
        (new BuilderWarning(!this.myTextElem))  .setSuggested(this.setTextRectObject)   .enforce(); 
        (new BuilderWarning(!this.myPngElem))   .setSuggested(this.setPngElem)          .enforce();
        (new BuilderWarning(!this.myOffColor))  .setSuggested(this.setColorOnMouseOut)  .enforce();
        (new BuilderWarning(!this.myOnColor))   .setSuggested(this.setColorOnMouseOver) .enforce();
        (new BuilderWarning(!this.#myFunc))     .setSuggested(this.setClickFunc)        .enforce();
        return this;
    }
    setPngElem(aPngElemID){ 
        this.myPngElem=document.getElementById(aPngElemID); 
        return this;
    }
    setColorOnMouseOut(aMouseOutColor){   
        this.myOffColor=aMouseOutColor; 
        let theMouseOutFunc=(aEvent)=>{ if (!this.myIsFreezeMouseHover) this.#fillMainElementIfNotLocked(aMouseOutColor);};
        this.myMainElem.addEventListener("mouseout", theMouseOutFunc);  
        if(this.myPngElem) this.myPngElem.addEventListener("mouseout", theMouseOutFunc); 
        if(this.myTextElem) this.myTextElem.addEventListener("mouseout", theMouseOutFunc);
        return this;
    } 
    setColorOnMouseOver(aMouseOverColor){  
        this.myOnColor=aMouseOverColor; 
        let theMouseOverFunc=(aEvent)=>{ if (!this.myIsFreezeMouseHover) this.#fillMainElementIfNotLocked(aMouseOverColor);};
        this.myMainElem.addEventListener("mouseover",theMouseOverFunc); 
        if(this.myPngElem) this.myPngElem.addEventListener("mouseover", theMouseOverFunc);
        if(this.myTextElem) this.myTextElem.addEventListener("mouseout", theMouseOverFunc);

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
    setTextRectObject(aText, aFontFamily, aFontSize, aFontWeight, aCenter=false){ 
        this.myTextElem = document.createElementNS("http://www.w3.org/2000/svg", "text");  
        this.myTextElem.textContent=aText;
        this.myTextElem.setAttribute("font-family", aFontFamily); 
        this.myTextElem.setAttribute("font-size", aFontSize); 
        this.myTextElem.setAttribute("font-weight", aFontWeight);   

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
 
    setToOnColor=()=>{this.myMainElem.setAttribute("fill", this.myOnColor);}
    setToOffColor=()=>{this.myMainElem.setAttribute("fill", this.myOffColor);}
    setLockFalse=()=>{this.#mySubscriberLock=false;}
    setLockTrue=()=>{this.#mySubscriberLock=true;} 
    setIsFreezeMouseHoverFalse=()=>{this.myIsFreezeMouseHover=false;}
    setIsFreezeMouseHoverTrue=()=>{this.myIsFreezeMouseHover=true;}

    getLockState=()=>this.#mySubscriberLock;  

    getAlias=()=>this.#myAlias;

    #executeFuncIfNotLocked=(aFunc)=>{if(!this.getLockState())aFunc();}
    #fillMainElementIfNotLocked=(aColor)=>{ if(!this.getLockState()) this.myMainElem.setAttribute("fill", aColor);} 
}  
