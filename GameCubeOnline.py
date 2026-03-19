''' 
#==[IMPORTANT LESSONS]==# 
- ARDUINO RESETS WHEN SERIAL CONNECTION IS ESTABLISHED, MUST WAIT A BIT 
- USE PYDANTIC TO MAKE POST REQUESTS EASY!!
'''

from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
from fastapi.responses import HTMLResponse 
from fastapi.responses import FileResponse  
from fastapi.staticfiles import StaticFiles  
from contextlib import asynccontextmanager 
from pydantic import BaseModel
import uvicorn  
from SerialManagement import SerialManager 
from Capture import Capture
from HDMICapture import HDMICapture 
from SoundCapture import SoundCapture   
from SoundCapture import RulesetGuermox
import asyncio 
from starlette.websockets import WebSocketDisconnect

#seemingly biggest blockers were limiting the frame rate in the capture card thread and disabling print statements
theSerialManager=SerialManager()
theHDMICapture = HDMICapture(0,  350, 250, 70) 
#theHDMICapture = HDMICapture(0,  450, 350, 100) 

theSoundCapture = SoundCapture(2, 4096, RulesetGuermox())

async def postStreamingData(aClientId:int, aWebSocket:WebSocket, aCapture:Capture, aCaptureRate : float): 
    try:
        await aWebSocket.accept() # accepting the handshake
        while True:  
            theData=aCapture.getFrame(aClientId) 
            #numpy arrays are not native byte objects so to expose the view in the buffer protocol, we're gonna have to use the meoryview function here.
            if(theData.any()):await aWebSocket.send_bytes(memoryview(theData))
            # since the function is async, wed like a little pause in between packets so they dont play in parallel 
            # this also serves the benefit of not hitting the arduino writes too fast which are blocking. 
            await asyncio.sleep(aCaptureRate) 
    except WebSocketDisconnect:  
        aCapture.unsubscribe(aClientId)
        print (f"Client: {aClientId} Unsubscribed From {aCapture.__class__.__name__}.") 
    except Exception as aError: print("The following unknown error has occured", aError)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static" )


@app.get("/", response_class=HTMLResponse) 
async def root():  
    return FileResponse("static/HTML/GameCubeOnline.html") 

@app.get("/subscribe_audio")
async def subscribeAudio(): 
    theClientId=theSoundCapture.subscribe() 
    return {"audioClientId": theClientId}

@app.get("/subscribe_video")
async def subscribeVideo(): 
    theClientId=theHDMICapture.subscribe() 
    return {"videoClientId": theClientId}

@app.get("/audio_metadata") 
async def getSampleRate(): 
    return {"sampleRate":theSoundCapture.getSampleRate(), "channels":theSoundCapture.getChannels()}

@app.get("/serial_connections_ct") 
async def getSerialConnectionsCount(): 
    return {"count":theSerialManager.getSerialConnectionsAmt()}



@app.websocket("/serial_post/{aId}")
async def postToSerial(aId:int,aWebSocket: WebSocket): 
    await aWebSocket.accept() 
    try: 
        while True:  
            theBytes=await aWebSocket.receive_bytes()
            theSerialManager[aId].put(theBytes) 
            #careful, print statements can be expensive --> https://stackoverflow.com/questions/13288185/performance-effect-of-using-print-statements-in-python-script  
            #this is because printing is a synchronous call --> https://medium.com/spencerweekly/console-output-overhead-why-is-writing-to-stdout-so-slow-b0cc7c88704c 
            ''' 
                So it turns out that I/O buffering is what made even “writing to file” faster than “writing to stdout”. 
                When we are directly writing outputs to our terminal, each writing operation is being done “synchronously”, which means our programs waits for the “write” to complete before it continues to the next commands.
            '''
            #print(f"{theBytes.decode('utf-8')} Were Pressed!") 
            #print("What Was Sent:       "+' '.join(format(aByte, '08b') for aByte in theBytes))
            #print("What Was Accepted:   "+' '.join(format(aByte, '08b') for aByte in theSerialManager[aId].mySerialConnection.read(1)))
    except WebSocketDisconnect: print(f"Connection To Controller {aId} Disconnected.")
    except Exception as aError: print("The following unknown error has occured", aError)

    # https://stackoverflow.com/questions/49005651/how-does-asyncio-actually-work 
    # Think of async as a generator 
    # think of await as a yield statement 
    
     
    return {"status": "ok"}  

@app.websocket("/frame_data/{aClientId}") # FUTURE USE FOR GAME CONSOLE
async def postFrameData(aClientId:int, aWebSocket:WebSocket):
    await postStreamingData(aClientId, aWebSocket, theHDMICapture,1/60)

    #StreamingResponse Accepts a generator 
    '''
        async functions in python are known as couroutines (functions that can pause their execution) 
        Async functions are put into an event loop 
        when an await keyword is encountered it can do one of 2 things 
            immediately finish and continue execution in the current function 
            pause the function and jump to the next thing in the event loop 
        so here, if the await for the event loop stalls too long, it will go on with the next thing in the event loop

    '''  
    

@app.websocket("/audio_data/{aClientId}") 
async def postAudio(aClientId: int ,aWebSocket:WebSocket): 
    await postStreamingData(aClientId, aWebSocket, theSoundCapture,1/60)
    #https://blog.postman.com/how-do-websockets-work/ 
    ''' 
    Websockets are a persistent bidirectional communication between server and client. 
    
    Unlike HTTP which is only initiated on request. 

    Think of HTTP like texting someone, you send a message, and wait for something back. 

    If HTTP is like texting, then Websockets are a like a phone call. 

    CLIENT--> sends a websocket request containing: 
        "Upgrade: websocket: Asks the server to upgrade from HTTP to WebSocket

        Connection: Upgrade: Indicates this is an upgrade request 

        Sec-WebSocket-Key: A randomly generated base64-encoded value for security

        Sec-WebSocket-Version: The WebSocket protocol version (13 is current)" 
    
    DATA PROTOCOL--> In the form of: 
        "FIN bit: Indicates if this is the final frame in a message

        Opcode: Specifies the frame type (text, binary, close, ping, pong)

        Mask bit: Client-to-server frames must be masked for security

        Payload length: Size of the message data

        Payload data: The actual message content"
    '''



if __name__ == '__main__':
    uvicorn.run(app, port=8000, host='0.0.0.0')