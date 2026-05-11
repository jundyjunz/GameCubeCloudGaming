import { InteractiveHtmlElementSingleton } from "/static/Javascript/InteractiveHtmlElement/InteractiveHtmlElementSingleton.js"; 
import { Toggle } from "/static/Javascript/InteractiveHtmlElement/Toggle.js";   
import { Button } from "/static/Javascript/InteractiveHtmlElement/Button.js";
import { MultiToggle } from "/static/Javascript/InteractiveHtmlElement/MultiToggle.js";
import { Slider } from  "/static/Javascript/InteractiveHtmlElement/Slider.js"
import { ErrorBar } from "/static/Javascript/InteractiveHtmlElement/ErrorBar.js";
import { SwitchButton } from "/static/Javascript/InteractiveHtmlElement/SwitchButton.js";

import { RESTapiHelpers } from "/static/Javascript/Helpers/RESTapiHelpers.js";

import { AudioPlayer } from "/static/Javascript/MediaPlayers/AudioPlayer.js";
import { FramePlayer } from "/static/Javascript/MediaPlayers/FramePlayer.js";

import { Packet } from "/static/Javascript/Packets/Packet.js";
import { GameCubePacket } from "/static/Javascript/Packets/GameCubePacket.js";
import { PacketSingleton } from "/static/Javascript/Packets/PacketSingleton.js";

import { ControlButtonCollection } from "/static/Javascript/ControlButtonCollection.js";

// await tosses all following code in an async function into microtask queue. 
document.addEventListener( "DOMContentLoaded", (event)=>{ 

    // any objects that have a setinit function for the builder pattern, those MUST go last in the builder chain.
   

    let theVideoFramesId ="VideoFrames";
    let theVolumeButtonId="VolumeButton";
    let theWholePageId="WholePage"; 
    let theGameCubeControllerVideoWrapperId ="GameCubeControllerVideoWrapper"; 
    let theAudioPlayer;   
    let theMaxControllerCount; 
    PacketSingleton.setPacket(Packet);
    RESTapiHelpers.RESTGet("/serial_connections_ct",(aData)=>{ theMaxControllerCount=aData.count;});
    
    RESTapiHelpers.RESTGet("/subscribe_audio", (aData)=>{ 
        console.log(`AudioPlayer Subscribed at: ${aData.audioClientId}`);
        theAudioPlayer = (new AudioPlayer(`/audio_data/${aData.audioClientId}`)) 
                        .setInitialVolume(0)
                        .setAudioTimeBuffer(0.1)
                        .setPlayer( "/audio_metadata") 
                        .setInit();});  

   
    RESTapiHelpers.RESTGet("/subscribe_video", (aData)=>{ 
        console.log(`VideoPlayer Subscribed at: ${aData.videoClientId}`); 
        (new FramePlayer(`/frame_data/${aData.videoClientId}`)) 
        .setCanvasElem(theVideoFramesId)  
        .setFilter("saturate(130%) contrast(110%) brightness(100%)")
        .setPlayer() 
        .setInit();});

   
    
    let theInstructions=[
        ["AButtonKey",          "AButton",          "KeyK",         "a"                      ],        
        ["BButtonKey",          "BButton",          "KeyJ",         "b"                      ],      
        ["XButtonKey",          "XButton",          "KeyL",         "x"                      ],        
        ["YButtonKey",          "YButton",          "KeyI",         "y"                      ],       
        ["DPadUpKey",           "DPadUp",           "ArrowUp",      "dup"                    ],      
        ["DPadDownKey",         "DPadDown",         "ArrowDown",    "ddown"                  ],     
        ["DPadLeftKey",         "DPadLeft",         "ArrowLeft",    "dleft"                  ],    
        ["DPadRightKey",        "DPadRight",        "ArrowRight",   "dright"                 ],   
        ["StartButtonKey",      "StartButton",      "KeyQ",         "start"                  ],  
        ["LeftTriggerKey",      "LeftTrigger",      "KeyU",         "ltrigger"               ],
        ["RightTriggerKey",     "RightTrigger",     "KeyO",         "rtrigger"               ],
        ["CStickUpKey",         "CStick",           "Numpad8",      "cup",        [0,-1]     ],
        ["CStickDownKey",       "CStick",           "Numpad5",      "cdown",      [0,1]      ],
        ["CStickLeftKey",       "CStick",           "Numpad4",      "cleft",      [-1,0]     ],
        ["CStickRightKey",      "CStick",           "Numpad6",      "cright",     [1,0]      ],
        ["MainStickUpKey",      "MainStick",        "KeyW",         "up",         [0,-1]     ],
        ["MainStickDownKey",    "MainStick",        "KeyS",         "down",       [0,1]      ],
        ["MainStickLeftKey",    "MainStick",        "KeyA",         "left",       [-1,0]     ],
        ["MainStickRightKey",   "MainStick",        "KeyD",         "right",      [1,0]      ],
        ["ZButtonKey",          "ZButton",          "KeyE",         "ztrigger"               ]  
    ] 

    let theControlButtonCollection =new ControlButtonCollection() 
                                        .setKeyShortenThreshold(5)
                                        .setDefaultInstructions(theInstructions) 
                                        .setCookieName("ControllerButtonCookie")  
                                        .setInit(theInstructions);

   
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
        if (aControllerID == null) { theErrorBar.enableError(`There are currently ${theMaxControllerCount} connected controllers! \n Please select a controller!`, () => { PacketSingleton.killWebSocket(); } ); return;  }
        if (aControllerID >= theMaxControllerCount) { theErrorBar.enableError(`There are currently ${theMaxControllerCount} connected controllers! \n You are playing on controller #${aControllerID + 1} which does not exist!`, () => { PacketSingleton.killWebSocket(); }); return;}
        theErrorBar.disableError();
        PacketSingleton.setWebSocket(`/serial_post/${aControllerID}`, aControllerID);}; 

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
    .setClickFunc(()=>{theControlButtonCollection.resetToDefaultControlButtons();}) 
    .setAlias("ResetButton")
    .setInit());

    let theErrorBar=InteractiveHtmlElementSingleton.registerElement((new ErrorBar("ErrorRect")) 
    .setColorOnMouseOut("lightcoral") 
    .setColorOnMouseOver("red")
    .setTextSettings("Trebuchet MS", 15, "bold", true) 
    .setAlias("ErrorBar")
    .setInit());
    
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
    .setSliderCircleSizeWhenMouseDown(2)  
    .setSliderPosition0()
    .setSliderFunc((aRatio)=>{theChangeButtonBasedOnVolume(aRatio);}) 
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

