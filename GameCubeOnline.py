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
from HDMICapture import HDMICapture 
from SoundCapture import SoundCapture   
from SoundCapture import RulesetGuermox
from CaptureCollection import CaptureCollection
import asyncio 
from starlette.websockets import WebSocketDisconnect

class SerialData(BaseModel): 
    myData:str 


theSerialManager=SerialManager()
theHDMICapture = HDMICapture(0, 515, 390, 45)  
theSoundCapture = SoundCapture(2, 4096, "float32", RulesetGuermox())
theCaptureCollection= CaptureCollection([theHDMICapture, theSoundCapture])

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static" )


@app.get("/", response_class=HTMLResponse) 
async def root():  
    return FileResponse("static/HTML/GameCubeOnline.html") 

@app.get("/subscribe")
async def subscribe(): 
    theClientId=theCaptureCollection.subscribeAll() 
    return {"clientId": theClientId}


@app.get("/audio_metadata") 
async def getSampleRate(): 
    return {"sampleRate":theSoundCapture.getSampleRate(), "channels":theSoundCapture.getChannels()}

@app.get("/serial_connections_ct") 
async def getSerialConnectionsCount(): 
    return {"count":theSerialManager.getSerialConnectionsAmt()}

@app.get("/frame_data/{aClientId}") 
async def getFrameData(aClientId:int):  
    #StreamingResponse Accepts a generator
   
    return StreamingResponse( 
        theHDMICapture.getFrame(aClientId),  
        media_type="multipart/x-mixed-replace; boundary=frame", # needs to know its multpart such that it can coninously stream
        headers={ # TLDR: the data expires on use and is not stored anywhere. 
            "Cache-Control": "no-cache, no-store, must-revalidate", # no cache --> must revalidate with server before storing, no store--> dont actually cache, must revaildate-->revalidate the data before use
            "Pragma": "no-cache", # for legacy http support 
            "Expires": "0", # makes stale immediately (how long the data lasts before dying) 
        }) 

@app.post("/serial_post/{aId}")
async def postToSerial(aId:int, aData :SerialData):  
    # https://stackoverflow.com/questions/49005651/how-does-asyncio-actually-work 
    # Think of async as a generator 
    # think of await as a yield statement 
    
    theSerialManager[aId].write(aData.myData.encode("utf-8")) 
    '''
    await asyncio.to_thread( 
        theSerialManager[aId].write,
        aData.myData.encode("utf-8")
    ) 
    '''
     
    return {"status": "ok"}  

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
@app.websocket("/audio/{aClientId}") 
async def postAudio(aClientId: int ,aWebSocket:WebSocket): 
    try:
        await aWebSocket.accept() # accepting the handshake
        while True:  
            theData=theSoundCapture.getFrame(aClientId)
            if(theData):await aWebSocket.send_bytes(theData) # formatting the bytes in the protocol format
            else: await asyncio.sleep(0.001) # since the function is async, wed like a little pause in between packets so they dont play in parallel
    except WebSocketDisconnect:   
        theCaptureCollection.unsubscibeAll(aClientId) 
        print (f"Client: {aClientId} Unsubscribed.") 
    except Exception as aError: 
        print("The following unknown error has occured", aError)

if __name__ == '__main__':
    uvicorn.run(app, port=8000, host='0.0.0.0')