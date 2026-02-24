
export class RTCReceiver{ 
    #myVideoElem;  
    #myPeerConnection;
    constructor(aVideoElem){ 
        this.#myVideoElem = document.getElementById(aVideoElem);  
        this.#myVideoElem.srcObject=new MediaStream();
        this.#myPeerConnection = new RTCPeerConnection();
        this.#myPeerConnection.addTransceiver("video", { direction: "recvonly" });
        //this.#myPeerConnection.addTransceiver("audio", { direction: "recvonly" });
        this.#myPeerConnection.ontrack = (aEvent) => { 
            this.#myVideoElem.srcObject.addTrack(aEvent.track); // we are getting video and audio here all in one. if we had multiple video, wed refer to more than just the 0th stream
        }; 
    } 

    async sendOffer(aOfferRoute){ 
        const theOfferToSend = await this.#myPeerConnection.createOffer(); 
        await this.#myPeerConnection.setLocalDescription(theOfferToSend); 
        const theAnswer = await (await fetch(aOfferRoute, { 
            method:'POST', 
            body:JSON.stringify({sdp:theOfferToSend.sdp, type:theOfferToSend.type}), 
            headers: {"Content-Type": "application/json"}
        })).json(); 

        await this.#myPeerConnection.setRemoteDescription(theAnswer);
    }

}
