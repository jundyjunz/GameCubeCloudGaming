import { InteractiveHtmlElementSingleton } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementSingleton.js"; 
import { Toggle } from "/static/Javascript/InteractiveHtmlElement/Toggle.js";   
import { Button } from "/static/Javascript/InteractiveHtmlElement/Button.js";
import { MultiToggle } from "/static/Javascript/InteractiveHtmlElement/MultiToggle.js";
import { Slider } from  "/static/Javascript/InteractiveHtmlElement/Slider.js"
import { ErrorBar } from "/static/Javascript/InteractiveHtmlElement/ErrorBar.js";
import { SwitchButton } from "/static/Javascript/InteractiveHtmlElement/SwitchButton.js";

import { RESTapiHelpers } from "/static/Javascript/Helpers/RESTapiHelpers.js";
import { AudioPlayer } from "/static/Javascript/MediaPlayers/AudioPlayer.js";
import { VideoPlayer } from "/static/Javascript/MediaPlayers/VideoPlayer.js";


import { GameControllerPacket } from "/static/Javascript/GameController/GameControllerPacket.js";
import { GamecubeControllerPacketDispatch } from "/static/Javascript/GameController/GameControllerPacketDispatch.js";  
import { GameController } from "/static/Javascript/GameController/GameController.js";
// await tosses all following code in an async function into microtask queue. 
document.addEventListener( "DOMContentLoaded", (event)=>{ 

    // any objects that have a setinit function for the builder pattern, those MUST go last in the builder chain.
   

    let theVideoFramesId ="VideoFrames";
    let theVolumeButtonId="VolumeButton";
    let theWholePageId="WholePage"; 
    let theGameCubeControllerVideoWrapperId ="GameCubeControllerVideoWrapper"; 
    let theAudioPlayer;  
    RESTapiHelpers.RESTGet("/subscribe_audio", (aData)=>{ 
        console.log(`AudioPlayer Subscribed at: ${aData.audioClientId}`);
        theAudioPlayer = (new AudioPlayer(`/audio_data/${aData.audioClientId}`)) 
                        .setInitialVolume(0)
                        .setAudioTimeBuffer(0.1)
                        .setPlayer( "/audio_metadata") 
                        .setInit();});  

    RESTapiHelpers.RESTGet("/subscribe_video", (aData)=>{ 
        console.log(`VideoPlayer Subscribed at: ${aData.videoClientId}`); 
        (new VideoPlayer(`/frame_data/${aData.videoClientId}`)) 
        .setCanvasElem(theVideoFramesId) 
        .setPlayer() 
        .setInit();});


    
    let theDispatchMap = new Map([
        ["KeyW",        (new GameControllerPacket('U',"MainStick"))   .setKeyButtonElement("MainStickUpKey")    .setVector([0,-1])], //up
        ["KeyA",        (new GameControllerPacket('L',"MainStick"))   .setKeyButtonElement("MainStickLeftKey")  .setVector([-1,0])], // left
        ["KeyS",        (new GameControllerPacket('D',"MainStick"))   .setKeyButtonElement("MainStickDownKey")  .setVector([0,1])], // down
        ["KeyD",        (new GameControllerPacket('R',"MainStick"))   .setKeyButtonElement("MainStickRightKey") .setVector([1,0])], // right
        ["KeyE",        (new GameControllerPacket('z',"ZButton"))     .setKeyButtonElement("ZButtonKey")], // z 
        ["KeyQ",        (new GameControllerPacket('s',"StartButton")) .setKeyButtonElement("StartButtonKey")], // start 

        ["KeyI",        (new GameControllerPacket('y',"YButton"))     .setKeyButtonElement("YButtonKey")], // y
        ["KeyJ",        (new GameControllerPacket('b',"BButton"))     .setKeyButtonElement("BButtonKey")], // b
        ["KeyK",        (new GameControllerPacket('a',"AButton"))     .setKeyButtonElement( "AButtonKey")], // a
        ['KeyL',        (new GameControllerPacket('x',"XButton"))     .setKeyButtonElement("XButtonKey")], // x
        ['KeyU',        (new GameControllerPacket('l',"LeftTrigger")) .setKeyButtonElement("LeftTriggerKey")], // left trigger
        ['KeyO',        (new GameControllerPacket('r',"RightTrigger")).setKeyButtonElement("RightTriggerKey")], // right trigger
        
        ['Numpad8',     (new GameControllerPacket('5',"CStick"))      .setKeyButtonElement("CStickUpKey")       .setVector([0,-1])], // cup
        ['Numpad5',     (new GameControllerPacket('6',"CStick"))      .setKeyButtonElement("CStickDownKey")     .setVector([0,1])], // cdown
        ['Numpad4',     (new GameControllerPacket('7',"CStick"))      .setKeyButtonElement("CStickLeftKey")     .setVector([-1,0])], // cleft
        ['Numpad6',     (new GameControllerPacket('8',"CStick"))      .setKeyButtonElement("CStickRightKey")    .setVector([1,0])], // cright 

        ["ArrowUp",     (new GameControllerPacket('1',"DPadUp"))      .setKeyButtonElement("DPadUpKey")], // dup
        ["ArrowLeft",   (new GameControllerPacket('2',"DPadLeft"))    .setKeyButtonElement("DPadLeftKey")], // dleft
        ["ArrowDown",   (new GameControllerPacket('3',"DPadDown"))    .setKeyButtonElement("DPadDownKey")], // ddown
        ["ArrowRight",  (new GameControllerPacket('4',"DPadRight"))   .setKeyButtonElement("DPadRightKey")] // dright
    ]);
    let theGameControllerPacketDispatch=    (new GamecubeControllerPacketDispatch ( theDispatchMap ))
                                            .setDispatchCookieName("theGameControllerPacketDispatch") 
                                            .setKeyShortenThreshold(5)
                                            .setDefaultDispatchMap(theDispatchMap)
                                            .setColorOnMouseOut("gainsboro")
                                            .setColorOnMouseOver("dimgray")
                                            .setTextSettings("tahoma", 8, "bold") 
                                            .setOverlayClass("overlay") 
                                            .setInit();
    let theController = new GameController(theGameControllerPacketDispatch) 
                            .setSerialConnectionsRoute("/serial_connections_ct") 
                            .setInit();
    
    let theSetOverlays=(aState)=>{document.querySelectorAll(".overlay").forEach((aElement)=>{aElement.setAttribute("visibility",aState);});}
    let theSetFullScreen=()=>{ 
        document.getElementById(theWholePageId).style.gridTemplateColumns="1fr";
        document.getElementById(theVideoFramesId).style.height="50%";
        document.getElementById(theGameCubeControllerVideoWrapperId).style.display="inline";
        document.documentElement.requestFullscreen();}; 
    let theSetSmallScreen=()=>{ 
        document.getElementById(theWholePageId).style.gridTemplateColumns="1fr 1fr";
        document.getElementById(theVideoFramesId).style.height="100%";
        document.getElementById(theGameCubeControllerVideoWrapperId).style.display="grid";
        document.exitFullscreen();};
    let theTurnOnAudio=()=>{ 
        theAudioPlayer.turnOnAudioPlayer();
        let theSlider=InteractiveHtmlElementSingleton.getElementByType(Slider) 
        if(theSlider.getSliderRatio()!=0)return; 
        theSlider.setSliderPosition100(); 
        theAudioPlayer.setVolume(1);}; 
    let theTurnOffAudio=()=>{ 
        theAudioPlayer.turnOffAudioPlayer();
        InteractiveHtmlElementSingleton.getElementByType(Slider).setSliderPosition0(); 
        theAudioPlayer.setVolume(0);}; 
    let theChangeButtonBasedOnVolume=(aRatio)=>{ 
        theAudioPlayer.setVolume(aRatio);
        if(aRatio==0){InteractiveHtmlElementSingleton.getElement(theVolumeButtonId).setPngElemWhenSwitchedTrue(); theAudioPlayer.turnOffAudioPlayer();} 
        else{InteractiveHtmlElementSingleton.getElement(theVolumeButtonId).setPngElemWhenSwitchedFalse(); theAudioPlayer.turnOnAudioPlayer();}}; 
    let theSetController = (aControllerID)=>{ 
        let theMaxControllerCount=theController.getMaxControllerCount();
        if(aControllerID==null) {theErrorBar.enableError(`There are currently ${theMaxControllerCount} connected controllers! \n Please select a controller!`, ()=>{theController.killWebSocket();}); return;  }
        if(aControllerID>=theMaxControllerCount){theErrorBar.enableError(`There are currently ${theMaxControllerCount} connected controllers! \n You are playing on controller #${aControllerID+1} which does not exist!`,()=>{theController.killWebSocket();}); return;}
        theErrorBar.disableError();
        theController.updateWebSocket(`/serial_post/${aControllerID}`);};

    InteractiveHtmlElementSingleton.registerElement( 
    (new Toggle("OverlayToggleCircle"))
    .setColorOnMouseOut("gainsboro") 
    .setColorOnMouseOver("dimgray")  
    .setRectElem("OverlayToggleRect") // should be defined first if you want the togglePos functions to change its color
    .setTogglePosWhenToggledFalse(470, "skyblue", ()=>{theSetOverlays("visible");}) 
    .setTogglePosWhenToggledTrue(445,"gray",()=>{theSetOverlays("hidden");} ) 
    .setAlias("OverlayToggle")
    .setInit());

    InteractiveHtmlElementSingleton.registerElement(   
    (new Button("ResetCircle")) 
    .setColorOnMouseOut("darkRed") 
    .setColorOnMouseOver("red") 
    .setClickFunc(()=>{theGameControllerPacketDispatch.revertToDefaultDispatchMap();}) 
    .setAlias("ResetButton")
    .setInit());

    let theErrorBar= (new ErrorBar("ErrorRect")) 
    .setColorOnMouseOut("lightcoral") 
    .setColorOnMouseOver("red")
    .setTextSettings("Trebuchet MS", 15, "bold", true) 
    .setAlias("ErrorBar")
    .setInit();
    InteractiveHtmlElementSingleton.registerElement(theErrorBar);
    
    InteractiveHtmlElementSingleton.registerElement(
    (new SwitchButton("WindowSizeModifierButton")) 
    .setPngElem("WindowSizeModifierButtonPic") 
    .setColorOnMouseOut("gainsboro") 
    .setColorOnMouseOver("dimgray") 
    .setButtonWhenSwitchedFalse(()=>{theSetFullScreen()}, "static/Images/windowMaximize.png") 
    .setButtonWhenSwitchedTrue( ()=>{theSetSmallScreen()}, "static/Images/windowMaximize.png") 
    .setAlias("WindowSizeModifier")
    .setInit()); 

 
    InteractiveHtmlElementSingleton.registerElement(
    (new Slider( "VolumeSliderCircle", 90, 280))  
    .setColorOnMouseOut("gainsboro") 
    .setColorOnMouseOver("plum") 
    .setSliderCircleWhenMouseDown(2)  
    .setSliderPosition0()
    .setSliderFunc(2,(aRatio)=>{theChangeButtonBasedOnVolume(aRatio);}) 
    .setAlias("VolumeSlider")
    .setInit()); 
    
   
    InteractiveHtmlElementSingleton.registerElement(
    new SwitchButton("VolumeButton") 
    .setPngElem("VolumeButtonPic") 
    .setColorOnMouseOut("gainsboro") 
    .setColorOnMouseOver("dimgray") 
    .setButtonWhenSwitchedFalse(()=>{theTurnOnAudio();}, "static/Images/volumeOn.png") 
    .setButtonWhenSwitchedTrue(()=>{theTurnOffAudio();}, "static/Images/volumeOff.png") 
    .setAlias(theVolumeButtonId)
    .setInit());

    InteractiveHtmlElementSingleton.registerElement(
    (new MultiToggle()) 
    .setButton((new SwitchButton("SwitchCircle1")) 
    .setColorOnMouseOut("gray") 
    .setColorOnMouseOver("lightgreen") 
    .setInit()) //togglestate for each button should be initialized
    .setButton((new SwitchButton("SwitchCircle2")) 
    .setColorOnMouseOut("gray") 
    .setColorOnMouseOver("lightgreen") 
    .setInit())
    .setButton((new SwitchButton("SwitchCircle3")) 
    .setColorOnMouseOut("gray") 
    .setColorOnMouseOver("lightgreen")
    .setInit())  
    .setFunc((aControllerID)=>{ theSetController(aControllerID);})
    .setAlias("MultiToggle")
    .setInit());
    
});

