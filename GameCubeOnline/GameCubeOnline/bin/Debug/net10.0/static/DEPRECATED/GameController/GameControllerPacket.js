export class GameControllerPacket{ 
    #myKeyState; 
    #myButtonElement; 
    #myKeyButtonElement;
    #mySerialData;  
    #myVector;

    constructor(aSerialData, aButtonID){ 
        this.#mySerialData=aSerialData;  
        this.#myKeyState=false;  
        this.#myButtonElement=document.getElementById(aButtonID);
        this.#myKeyButtonElement=null;
        this.#myVector=null;
       
    } 
    getState=() => this.#myKeyState;   
    getButtonElement=()=>this.#myButtonElement;    
    getButtonElementID=()=>this.#myButtonElement.id;
    getKeyButtonElement=()=>this.#myKeyButtonElement;
    getKeyButtonElementID=()=>(this.#myKeyButtonElement?this.#myKeyButtonElement.id :null);
    getSerialData=()=> this.#mySerialData;
    getVector=()=>this.#myVector;
    setState(aBool) {this.#myKeyState=aBool;}  

    setKeyButtonElement(aKeyButtonElementID){ 
        this.#myKeyButtonElement=document.getElementById(aKeyButtonElementID);
        return this;
    }
    setVector(aVector){ 
        this.#myVector=aVector; 
        return this;
    }
}


