export class BuilderWarning{ 

    #myIsAttributeNullOrDefault;

    #myFunctionName;

    #myRequired;
    #mySuggested; 


    constructor(aAttributeNullOrDefault){ 
        this.#myIsAttributeNullOrDefault =aAttributeNullOrDefault;
        this.#myFunctionName=null; 
        this.#myRequired=false; 
        this.#mySuggested=false;
    } 
    
    setRequired(aFunction){ 
        this.#myFunctionName=aFunction.name;  
        this.#myRequired=true; 
        this.#mySuggested=false;
        return this;
    }
    setSuggested(aFunction){ 
        this.#myFunctionName=aFunction.name;  
        this.#myRequired=false; 
        this.#mySuggested=true;
        return this;
    }
 
    enforce(aExtraNotes=""){ 
        if(!this.#myIsAttributeNullOrDefault) return; 
        if(this.#myRequired && !this.#mySuggested) throw new Error(`You MUST Call ${this.#myFunctionName}() on This Class! \n${aExtraNotes}`); 
        if(!this.#myRequired && this.#mySuggested) console.warn(`You May Want To Call ${this.#myFunctionName}() on This Class. \n Ignore this Message If This Was Intentional \n ${aExtraNotes}`);
    }

}