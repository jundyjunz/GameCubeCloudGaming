
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";
import { MediaPlayer } from "/static/Javascript/MediaPlayer/MediaPlayer.js";

export class VideoPlayer extends MediaPlayer {  

    #myCanvasElem;
    #myCanvasContext;
    constructor(aSourceRoute) {  
        super(aSourceRoute); 
        this.#myCanvasElem=null; 
        this.#myCanvasContext=null;
        this.setWebSocketCloseMessage("Error in Connecting To Video"); 
        this.setWebSocketOpenMessage("The Video Is Connected.");
      
    }   
    setInit(){ 
        super.setInit();
        (new BuilderWarning(!this.#myCanvasElem || !this.#myCanvasContext)).setSuggested(this.setCanvasElem).enforce(`(This should be the highest priority thing you build in this class!)`);
        return this;
    }

    setCanvasElem(aCanvasElemID){ 
        this.#myCanvasElem=document.getElementById(aCanvasElemID);  
        this.#myCanvasContext=this.#myCanvasElem.getContext("2d");
        return this;
    }
    
    
    setPlayer=()=>{ 
        super.createWebSocket();
        this.myMediaOnMessageHandler=(async (aEvent)=>{await this.playMediaChunk(aEvent.data);})
        this.myWebSocket.onmessage = this.myMediaOnMessageHandler; 
        this.myIsSetPlayer=true;
        return this;
    }  

    async playMediaChunk(aBufferData){  
        //https://developer.mozilla.org/en-US/docs/Web/API/Blob
        //blob object in js if a file like object of immutavble data. Create Image Bitmap needs one of these guys.
        const theBitmap = await createImageBitmap(new Blob([aBufferData], { type: "image/jpeg" }));
        this.#myCanvasElem.width=theBitmap.width; 
        this.#myCanvasElem.height=theBitmap.height;
        this.#myCanvasContext.drawImage(theBitmap, 0, 0, this.#myCanvasElem.width, this.#myCanvasElem.height);

        theBitmap.close(); // important to avoid memory leaks
    } 

    
    
    killWebSocket=()=>{super.killWebSocket(this.constructor.name);}

  
}