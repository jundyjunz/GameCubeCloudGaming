import sounddevice as sd
import numpy as np
import asyncio 
from Capture import Capture
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

class SoundCapture(Capture):

    def __init__(self, aChannels, aBlockSize, aDtype, aRuleSet): 
        super().__init__(b"")

        self.myDevice=SoundCapture.getDevice(aRuleSet)  

        self.mySampleRate=self.myDevice["default_samplerate"]  
        self.myChannels = aChannels

        self.myStream  = sd.RawInputStream(
            device=self.myDevice["index"],
            samplerate=self.myDevice["default_samplerate"],
            channels=aChannels,  
            blocksize=aBlockSize,  
            dtype=aDtype,
            callback=self.soundCaptureCallback
        )  

        self.myStream.start()
   

    @staticmethod 
    def getDevice(aRuleset): 
        theDevices = sd.query_devices() 
        theDevices = [aDevice for aDevice in theDevices if aRuleset.check(aDevice)] 
        if theDevices==[]:  raise ValueError(f"No Valid Device of Type: {type(aRuleset).__name__} !") 
        return theDevices[0] 
    
    def soundCaptureCallback(self, aInData, aFrames, aTime, aStatus): super().publishToAllSubscribers(bytes(aInData))

    def getSampleRate(self): return self.mySampleRate 
    
    def getChannels(self): return self.myChannels



    

    
        


    

    
