export class ValidationHelpers{ 

    static isMapTypeOf(aType, aMap){ 
        try{   
            if(!Array.from(aMap.values()).every( (aElement)=>(aElement instanceof aType)))   
                throw new Error(`Attempting to Register Non ${aType.name}`)
        } 
        catch{throw new Error("Attempted to add non map element!");}
    }  
    static isArrayTypeOf(aType, aArray){ 
        try{   
            if(!aArray.every( (aElement)=>(aElement instanceof aType)))   
                throw new Error(`Attempting to Register Non ${aType.name}`)
        } 
        catch{throw new Error("Attempted to add non Array element!");}
    }

    static isTypeOf(aType, aElement){ 
        if(!(aElement instanceof aType)) throw new Error(`Element is not of type ${aType.name}.`); 
    }
}