import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class Slider extends InteractiveHtmlElement{  
    #mySVGMinDistance; 
    #mySVGMaxDistance; 
    #myIsDragging;
    #myBaseRadius;   
    #mySliderFuncEnabled;
    #mySVGReferencePoint; 
    #myRadiusMultiplier;
    constructor(aElemID, aSVGMinDistance, aSVGMaxDistance){  
        super(aElemID); 
        
        this.#myBaseRadius = Number(this.myMainElem.getAttribute("r"));
        this.#myIsDragging=false; 
        this.#mySliderFuncEnabled=false;
        this.#mySVGMinDistance=aSVGMinDistance; 
        this.#mySVGMaxDistance=aSVGMaxDistance;  
        this.#mySVGReferencePoint= this.myMainElem.ownerSVGElement.createSVGPoint();  
        this.#myRadiusMultiplier=null;


        document.addEventListener("mouseup",(aEvent)=>{ 
            if(this.getLockState()) return;
            this.#setSliderSize(this.#myBaseRadius);
            this.setToOffColor();
            this.#myIsDragging=false; 
        });
    }   

    setInit(){ 
        super.setInit(); 
        (new BuilderWarning(!this.#myRadiusMultiplier)).setSuggested(this.setSliderCircleSizeWhenMouseDown).enforce();
        (new BuilderWarning(this.#mySliderFuncEnabled==false)).setSuggested(this.setSliderFunc).enforce(`You must set the slider circle's size first before setting thsi function.`);
        return this;
    }
   
    setSliderCircleSizeWhenMouseDown(aRadiusMultiplier){ 
        this.myMainElem.addEventListener("mousedown", (aEvent)=>{  
            if(this.getLockState()) return;
            this.#setSliderSize(this.#myBaseRadius*aRadiusMultiplier);
            this.setToOnColor();  
            this.#myIsDragging=true; 
        });   
        this.#myRadiusMultiplier=aRadiusMultiplier;
        return this;
    }

    setSliderFunc(aFunc){ 
        document.addEventListener("mousemove",(aEvent)=>{ 
            if(this.getLockState()) return;
            if(!this.#myIsDragging)return;
            this.#setSliderSize(this.#myBaseRadius*this.#myRadiusMultiplier); 
            this.setToOnColor();
            let theIsXCoordValid = this.#isXCoordValid(aEvent.clientX);
            if(!theIsXCoordValid[0])return;   
            this.myMainElem.setAttribute("cx", theIsXCoordValid[1]); 
            aFunc(this.getSliderRatio()); 
        }); 
        this.#mySliderFuncEnabled=true;
        return this;
    }  

    #isXCoordValid(aXCoord){  
        /*
            - svgpoint represents a 2d point in the svg coordinate system --> https://developer.mozilla.org/en-US/docs/Web/API/SVGPoint 
            - we set the svgpoint's x coordinate to the mouse's event coordinate which is not yet scaled to the svg element. 
            - therefore we take the point and matrix transform it according to the mainelem's svg parent. 
            - we provide the parent's transform matrix --> https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getScreenCTM  
            - and inverse it. --> [x_svg, y_svg] * CTM = [x_screen, y_screen] --> [x_svg, y_svg] = [x_screen, y_screen] * CTM⁻¹
            - "getScreenCTM() returns the matrix that converts: SVG coordinates  →  screen coordinates"
        */
        this.#mySVGReferencePoint.x=aXCoord;
        aXCoord=this.#mySVGReferencePoint.matrixTransform(this.myMainElem.ownerSVGElement.getScreenCTM().inverse());
        return [aXCoord.x>=this.#mySVGMinDistance && aXCoord.x<=this.#mySVGMaxDistance, aXCoord.x];
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