import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class Slider extends InteractiveHtmlElement{  
    #mySVGMinDistance; 
    #mySVGMaxDistance; 
    #myIsDragging;
    #myBaseRadius;   
    #mySliderDownFuncEnabled; 
    #mySliderFuncEnabled;
    constructor(aElemID, aSVGMinDistance, aSVGMaxDistance){  
        super(aElemID); 
        
        this.#myBaseRadius = Number(this.myMainElem.getAttribute("r"));
        this.#myIsDragging=false; 
        this.#mySliderDownFuncEnabled=false; 
        this.#mySliderFuncEnabled=false;
        this.#mySVGMinDistance=aSVGMinDistance; 
        this.#mySVGMaxDistance=aSVGMaxDistance; 

        document.addEventListener("mouseup",(aEvent)=>{ 
            if(this.getLockState()) return;
            this.#setSliderSize(this.#myBaseRadius);
            this.setToOffColor();
            this.#myIsDragging=false; 
        });
    }   

    setInit(){ 
        super.setInit(); 
        (new BuilderWarning(this.#mySliderDownFuncEnabled==false))  .setSuggested(this.setSliderCircleWhenMouseDown).enforce();
        (new BuilderWarning(this.#mySliderFuncEnabled==false))      .setSuggested(this.setSliderFunc)               .enforce();
        return this;
    }
   
    setSliderCircleWhenMouseDown(aRadiusMultiplier){ 
        this.myMainElem.addEventListener("mousedown", (aEvent)=>{  
            if(this.getLockState()) return;
            this.#setSliderSize(this.#myBaseRadius*aRadiusMultiplier);
            this.setToOnColor();  
            this.#myIsDragging=true; 
        });   
        this.#mySliderDownFuncEnabled=true;
        return this;
    }

    setSliderFunc(aRadiusMultiplier, aFunc){ 
        document.addEventListener("mousemove",(aEvent)=>{ 
            if(this.getLockState()) return;
            if(!this.#myIsDragging)return;
            this.#setSliderSize(this.#myBaseRadius*aRadiusMultiplier); 
            this.setToOnColor();
            let theIsXCoordValid = this.#isXCoordValid(aEvent.clientX,this.#myBaseRadius*aRadiusMultiplier);
            if(!theIsXCoordValid[0])return;   
            this.myMainElem.setAttribute("cx", theIsXCoordValid[1]); 
            aFunc(this.getSliderRatio()); 
        }); 
        this.#mySliderFuncEnabled=true;
        return this;
    }  

    #isXCoordValid(aXCoord, aEnlargedRadiusSize){ 
        let theRect = this.myMainElem.ownerSVGElement.getBoundingClientRect();
        aXCoord = aXCoord - theRect.left - aEnlargedRadiusSize;
        return [aXCoord>=this.#mySVGMinDistance && aXCoord<=this.#mySVGMaxDistance, aXCoord];
    }

    setSliderPosition0=()=>{ 
        this.myMainElem.setAttribute("cx", this.#mySVGMinDistance);  
        return this;
    } 
    setSliderPosition100=()=>{ 
        this.myMainElem.setAttribute("cx", this.#mySVGMaxDistance); 
        return this;
    }


    #setSliderSize=(aSize)=>{ this.myMainElem.setAttribute("r", aSize);}
    getSliderRatio=()=>(this.#getCurrentSliderPosition()-this.#mySVGMinDistance)/(this.#mySVGMaxDistance-this.#mySVGMinDistance);
    #getCurrentSliderPosition=()=> Number(this.myMainElem.getAttribute("cx"));  
    
   

   

}