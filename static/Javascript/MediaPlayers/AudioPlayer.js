import { RESTapiHelpers } from "/static/Javascript/Helpers/RESTapiHelpers.js";
import { Helpers } from "/static/Javascript/Helpers/Helpers.js";
import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";
import { MediaPlayer } from "/static/Javascript/MediaPlayers/MediaPlayer.js";
export class AudioPlayer extends MediaPlayer {  
    
    #myInitialVolume; 
    #myAudioTimeBuffer; 
    #myAudioContext; 
    #myNextTimeStamp;
    #myAudioMetaData; 
    #myVolumeControl; 


    constructor(aSourceRoute) {  
        super(aSourceRoute);
        this.#myAudioContext=null;  
        this.#myNextTimeStamp=null;
        this.#myAudioMetaData=null; 
        this.#myVolumeControl=null; 
        this.#myInitialVolume=0; 
        this.#myAudioTimeBuffer=0.1;  
        this.setWebSocketCloseMessage("Error in Connecting To Audio"); 
        this.setWebSocketOpenMessage("The Audio Is Connected.");
    }  
    setInit(){ 
        super.setInit();
        (new BuilderWarning(this.#myAudioTimeBuffer==0.1)).setSuggested(this.setAudioTimeBuffer).enforce(`(${this.#myAudioTimeBuffer} Isn't a Bad Value. Adjust If Necessary.)`);
        (new BuilderWarning(this.#myInitialVolume==0 )).setSuggested(this.setInitialVolume).enforce(`(${this.#myInitialVolume} Isn't a Bad Value. Adjust If Necessary.)`);
        return this;
    }
  
    setInitialVolume(aVolume){ 
        this.#myInitialVolume=aVolume;
        return this;
    }

    setVolume(aRatio){ 
        this.#myVolumeControl.gain.value=aRatio; 
        return this;
    } 
    setAudioTimeBuffer(aTimeBuffer){  
        this.#myAudioTimeBuffer=aTimeBuffer; 
        return this;
    }
    
    turnOnAudioPlayer(){
        this.myWebSocket.onmessage = this.myMediaOnMessageHandler;
        this.#myAudioContext.resume();
    }  

    turnOffAudioPlayer(){ 
        this.myWebSocket.onmessage=null; 
        this.#myAudioContext.suspend();
    }

    killWebSocket=()=>{super.killWebSocket(this.constructor.name);}
 

    setPlayer( aAudioMetaDataSourceRoute) {
        // Load metadata first  
        RESTapiHelpers.RESTGet(aAudioMetaDataSourceRoute, (aData)=>{ 
            this.#myAudioMetaData = aData;
            this.#myNextTimeStamp = 0; // timestamps for when audio should be played
            this.#createAudioContext(this.#myAudioMetaData);
            super.createWebSocket();
            this.setVolume(this.#myInitialVolume); 
            this.myMediaOnMessageHandler=(aEvent) => {this.#playMediaChunk(aEvent.data);};
        });  
        this.myIsSetPlayer=true;
        return this; 
    } 

    #createAudioContext(aAudioMetaData){ 
        this.#myAudioContext = new AudioContext({sampleRate: aAudioMetaData.sampleRate}); // this is the object that plays our audio for us
        this.#myVolumeControl = this.#myAudioContext.createGain(); // gaincontrol for audio adjustment
        this.#myVolumeControl.connect(this.#myAudioContext.destination); // connect gain node to output desitination node
    } 

    #playMediaChunk(aBufferData) {
        console.log("Received Audio chunk:", aBufferData.byteLength, "bytes");

        //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
        //for the audiocontext webapi
        /* 
            Typically, the audiocontext pipeline goes something like this. 
                - create an audiocontext object 
                - have that audiocontext create a source object (buffersource for byte objects, mediaelementsource for mp3s)  
                - connect that source to an output node (can be audiocontext.destination or a gain node) 
                - then play the sound (play, start etc.) 

                - More on Nodes: they are our way of manipulating the outcoming sound, so we can connect additional nodes to mess with with the output audio, or change them together 
                - current node architecture: source-->volume-->output
        */
        //creating a source object to use our buffer and volume controlled by connected control.
        const theSource = this.#myAudioContext.createBufferSource();
        const theAudioBuffer=this.#createAudioBuffer(aBufferData);
        theSource.buffer = theAudioBuffer;
        //connect source to output volume node, which connects to output node. 
        //theSource.connect(this.#myVolumeControl.connect(this.#myAudioContext.Destination))
        theSource.connect(this.#myVolumeControl); 
        const thePossiblyCorrectedTimeStamp=this.#makeTimeStampCorrection(); 
        this.#myNextTimeStamp= Helpers.default( thePossiblyCorrectedTimeStamp, this.#myNextTimeStamp);
        theSource.start(this.#myNextTimeStamp);
        this.#myNextTimeStamp += theAudioBuffer.duration;
    }

    #makeTimeStampCorrection(){ 
        //play the audio at the next timestamp 
        //if the next timestamp is a little ahead of the current time by 100ms, or behind the current time, make it so the packet plays now instead of earlier/later to avoid audio clashes  
        const theAudioTimeBuffer = this.#myAudioTimeBuffer;   
        const theTimeStampNow= this.#myAudioContext.currentTime
        const theIsNextTimeBelowCurrentTime= this.#myNextTimeStamp < theTimeStampNow; 
        const theIsDifferenceBetweenNextAndNowGreaterThanBuffer= this.#myNextTimeStamp - theTimeStampNow > theAudioTimeBuffer
        if (theIsNextTimeBelowCurrentTime || theIsDifferenceBetweenNextAndNowGreaterThanBuffer) return theTimeStampNow;  // Reset to now 
        return null;
    }

    #createAudioBuffer(aBufferData){ 
        const theAudioData = new Float32Array(aBufferData);
        
        const theAudioBuffer = this.#myAudioContext.createBuffer(
            this.#myAudioMetaData.channels,
            theAudioData.length / this.#myAudioMetaData.channels, // data channel twice as long due to packing left and right data into one array.
            this.#myAudioMetaData.sampleRate);
        
        const theLeftSpeaker = theAudioBuffer.getChannelData(0);
        const theRightSpeaker = theAudioBuffer.getChannelData(1);
        
        //feeding data into left and right speakers, data is fed serially ([L,R,L,R...]) from the databuffer to we need to split. 
        // we are just loading the data, it isn't being played yet.
        for (let i = 0; i < theAudioBuffer.length; i++) {
            theLeftSpeaker[i] = theAudioData[i * 2];
            theRightSpeaker[i] = theAudioData[i * 2 + 1];
        } 
        return theAudioBuffer;
    }
}