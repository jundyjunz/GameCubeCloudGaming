import { InteractiveHtmlElement } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElement.js";
import {ValidationHelpers} from "/static/Javascript/Helpers/ValidationHelpers.js"
export class InteractiveHtmlElementSingleton{ 
    static #myInstance = null; 
    #myElements;
    

    // in Js since a class is really more of a blueprint then anything, we must call "this" before all inside fields. 
    // In the constructor, "this" is interpreted as a singular instance 
    // in static methods, "this" is interpreted as the class
    // static private member variables belong only  to the class, not the instance. 
    // ==[LESSON]== rather in other words, "this" is treated differently whether you are in a nonstatic or static method when referring to static variables.

    // in C++, static variables belong to the class as well 
    // its just that "this" now gets reinterpreted to the class in all situations, not just for static classes.
    // i.e. this->x == class::x
    // this goes for remember how in copy constructors we can also access the  private fields of incoming other objects) 
    //==[LESSON]== in other words, C++ does not make a distinction between static and nonstatic methods for "this" when referring to static variables (partially why its usually omitted) 
    
    
    constructor(){  
        if(InteractiveHtmlElementSingleton.#myInstance){ 
            console.log("Attempted to access InteractiveElementSingleton's constructor!");
            return; 
        }
        this.#myElements = new Map();
    } 


    static registerElement(aInteractiveElement){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton();  
        ValidationHelpers.isTypeOf(InteractiveHtmlElement, aInteractiveElement);
        this.#myInstance.#myElements.set(aInteractiveElement.getAlias(), aInteractiveElement);
    }  

    static registerManyElements(aElements){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton(); 
        ValidationHelpers.isArrayTypeOf(InteractiveHtmlElement, aElements); 
        let theNewElementMap = new Map(aElements.map(aElement=>[aElement.getAlias(),aElement]));
        this.#myInstance.#myElements = new Map([...this.#myInstance.#myElements, ...theNewElementMap])
    }

    static setAllLocksFalse(){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton(); 
        this.#myInstance.#myElements.forEach((aElement, aKey)=>{aElement.setLockFalse();})
    }

    static setAllLocksTrue(){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton(); 
        this.#myInstance.#myElements.forEach((aElement, aKey)=>{aElement.setLockTrue();})
    } 
 
    static getLockStateAll(){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton();  
        return Array.from(this.#myInstance.#myElements.values()).every(aElement=>aElement.getLockState())

    }
    static getLockState(aKey){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton(); 
        if(this.#myInstance.#myElements.has(aKey)) return this.#myInstance.#myElements.get(aKey).getLockState(); 
        throw new Error(`Attempted to getLockState of ${aKey} which does not exist!`) 
    } 

    static getElementByType(aType){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton(); 
        let theElement=null; 
        this.#myInstance.#myElements.forEach((aElement, aKey)=>{if(aElement instanceof aType)theElement=aElement;}); 
        return theElement;
    }

    static getElement(aKey){ 
        if(!this.#myInstance) this.#myInstance = new InteractiveHtmlElementSingleton(); 
        let theElement=null; 
        if(this.#myInstance.#myElements.has(aKey)) theElement =this.#myInstance.#myElements.get(aKey)
        return theElement; 
    }

}
