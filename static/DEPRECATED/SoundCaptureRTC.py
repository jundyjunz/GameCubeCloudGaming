import sounddevice as sd
import numpy as np
import queue 
from fractions import Fraction 
from aiortc import MediaStreamTrack 
from av import AudioFrame 
import numpy as np 
import asyncio

class Ruleset: 
    def __init__(self, aRuleSet): 
      self.myRules= aRuleSet  

    def check(self, aDevice): 
        return all([aDevice[aRule[0]]==aRule[1] for aRule in self.myRules])

class RulesetGuermox(Ruleset): 
   
    def __init__(self):    
        #Information from sd.query_devices is hardware bound
        super().__init__([ 
           ("name", "Digital Audio Interface (USB3 Digital Audio)"),
           ("default_samplerate", 48000.0), 
           ("default_high_output_latency",  0.0), 
           ("default_low_output_latency", 0.0)
        ])

class SoundCaptureRTC(MediaStreamTrack):
    kind = "audio"
    def __init__(self, aChannels, aBlockSize, aDtype): 

        super().__init__()
        theDevices = sd.query_devices() 
        self.myRuleset = RulesetGuermox()  
        theDevices = [aDevice for aDevice in theDevices if self.myRuleset.check(aDevice)] 
        if theDevices==[]:  raise ValueError(f"No Valid Device of Type: {type(self.myRuleset).__name__} !") 
        self.myDevice=theDevices[0]  
        self.myAudioQueue = asyncio.Queue() 
        self.myTimeStamp=0 
        self.myStream  = sd.RawInputStream(
            device=self.myDevice["index"],
            samplerate=self.myDevice["default_samplerate"],
            channels=aChannels,  
            blocksize=aBlockSize,  
            dtype=aDtype,
            callback=self.soundCaptureCallback
        )  

        self.myStream.start()

    def soundCaptureCallback(self, aInData, aFrames, aTime, aStatus): 
        # behind the scenes, stream holds onto the same buffer that stores your indata object 
        # so what ends up happening is that we pass down the refrence all the way into adding the queue, 
        # Which could eventually change everything in the queue to that asnwer 
        self.myAudioQueue.put_nowait(bytes(aInData)) 

    async def generateFrame(self): 
        return await self.myAudioQueue.get() 
    
    async def recv(self): 
        theRawFrame=await self.generateFrame()
        theFrame = AudioFrame.from_ndarray(theRawFrame, format="s16", layout="mono") 
        theFrame.pts = self.myTimeStamp   
        #the timestamp here in this case is how many ever audio samples were recorded in a time window 
        # pts*timebase = seconds elapsed --> #samples / samplerate in hz = x seconds 
        # we compute the pts after here because AudioFrame objects dont already have a precomputed pts unlike videotrack objects
        self.myTimeStamp+=theFrame.shape[0]
        theFrame.time_base=Fraction(1, self.myDevice["default_samplerate"]) 
        return theFrame



    


    
        


    

    
