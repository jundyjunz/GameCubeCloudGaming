from aiortc import RTCPeerConnection, RTCSessionDescription
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse 
from fastapi.responses import FileResponse  
from fastapi.staticfiles import StaticFiles  
from pydantic import BaseModel
import uvicorn  
import SerialManagement as sm 
import HDMICaptureRTC as hcrtc
import SoundCaptureRTC as scrtc



''' 
- WebRTC (WebRealTimeCommunication) is a communication protocol that is meant for ultra high speed communication, even faster than websockets 

- It is peer to peer 

- It works by having a peer send a an SDP (Session Description Protocol) offer to a signaling server so that another peer can read the offer 

- The other peer will then read the offer from the server and answer back through the signaling server. 

- This will establish ICE (Interactive Connectivity Establishment) which is the standardization of passing available ip/ports for the peers to communicate over. 

- WebRTC will use TURN/STUN servers to sometimes intermediate the peer to peer connections

- Avoids complications due to NAT (network adress translation, modifies IP information in packet headers) and firewalls.
'''

#https://github.com/aiortc/aiortc/blob/2362e6d1f0c730a0f8c387bbea76546775ad2fe8/examples/server/server.py 
thePeerConnection = RTCPeerConnection() #the peerconnection object will manage signaling, stream handling and session management 

class SerialData(BaseModel): 
    myData:str 


theSerialManager=sm.SerialManager()


app = FastAPI() 
app.mount("/static", StaticFiles(directory="static"), name="static" )

@app.get("/", response_class=HTMLResponse) 
async def root(): 
    return FileResponse("static/HTML/GameCubeOnline.html") 

@app.get("/serial_connections_ct") 
async def getSerialConnectionsCount(): 
    return {"count":theSerialManager.getSerialConnectionsAmt()}


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

@app.post("/offer")
async def offer(aRequest: Request): 

    # when the /offer route is called, the client/browser is sending us the offer
    # we convert our request request into json.
    # we retrieve the sdp(session description protocol) and type arguments 
    # https://www.youtube.com/watch?v=WmR9IMUD_CY --> this is just the standard way of making an offer
    theParams = await aRequest.json()
    theOffer = RTCSessionDescription(sdp=theParams["sdp"], type=theParams["type"])

    #this object will hold the details of our answer back
    thePeerConnection = RTCPeerConnection()
     # Adding the capture devices to our serverside peer connection
    thePeerConnection.addTrack(hcrtc.HDMICaptureRTC(0))
    #thePeerConnection.addTrack(scrtc.SoundCaptureRTC(2, 4096, "float32"))
    #setting the Server's peerconnection's remote description to see what the client wants in terms of codecs, sdp etc. from the offer we just recieved

    await thePeerConnection.setRemoteDescription(theOffer) 
    

    for aTransceiver in thePeerConnection.getTransceivers():
        if aTransceiver._offerDirection is None: aTransceiver._offerDirection = "recvonly"

    #preparing an answer object in response to the clients offer. Setlocaldescription sets this answer to our server's peer connenction.
    await thePeerConnection.setLocalDescription(await thePeerConnection.createAnswer())

    #sending our answer to the client. 
    #pc.remoteDescription.sdp  # SDP string sent by client
    #pc.remoteDescription.type # "offer" in this case
    #pc.localDescription.sdp  # SDP string describing what server can send/receive
    #pc.localDescription.type # "answer" 

    return {"sdp": thePeerConnection.localDescription.sdp, "type": thePeerConnection.localDescription.type}


if __name__ == '__main__':
    uvicorn.run(app, port=8000, host='0.0.0.0')

