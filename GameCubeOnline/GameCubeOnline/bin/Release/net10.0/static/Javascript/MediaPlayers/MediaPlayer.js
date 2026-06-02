
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";

export class MediaPlayer {  
    
    
    myWebSocketOpenMessage; 
    myWebSocketCloseMessage; 
    myWebSocket; 
    mySourceRoute;
    myMediaOnMessageHandler;
    myIsSetPlayer;

   
    constructor(aSourceRoute) {  
        this.mySourceRoute=aSourceRoute; 
        this.myWebSocket=null;
        this.myWebSocketOpenMessage=null; 
        this.myWebSocketCloseMessage=null; 
        this.myDataOnMessageHandler=null; 
        this.myIsSetPlayer=false;
        
      
    }  
    setInit(){ 
        (new BuilderWarning(!this.myWebSocketOpenMessage)).setSuggested(this.setWebSocketOpenMessage).enforce();
        (new BuilderWarning(!this.myWebSocketCloseMessage)).setSuggested(this.setWebSocketCloseMessage).enforce();
        (new BuilderWarning(this.myIsSetPlayer==false)).setSuggested(this.setPlayer).enforce();
        return this;
    }
    setWebSocketCloseMessage(aMessage){ 
        this.myWebSocketCloseMessage=aMessage; 
        return this;
    } 
    setWebSocketOpenMessage(aMessage){
        this.myWebSocketOpenMessage=aMessage; 
        return this;
    } 
    createWebSocket(){ 
        this.myWebSocket = new WebSocket(this.mySourceRoute); // sending the websocket handshake to the server and creating the connection
        this.myWebSocket.binaryType = "arraybuffer";
        this.myWebSocket.onopen = () => {console.log(this.myWebSocketOpenMessage);};
        this.myWebSocket.onerror = (aError) => {console.error(this.myWebSocketCloseMessage);};
    }
 
    
    killWebSocket=(aStreamerName)=>{this.myWebSocket.close(1000, `${aStreamerName} Streaming Stopped`); }
 
  
}