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

    def __init__(self, aChannels, aBlockSize, aRuleSet): 
        super().__init__(aBlockSize*4*aChannels) #(x 4 for float32)

        self.myDevice=SoundCapture.getDevice(aRuleSet)  

        self.mySampleRate=self.myDevice["default_samplerate"]  
        self.myChannels = aChannels

        self.myStream  = sd.RawInputStream(
            device=self.myDevice["index"],
            samplerate=self.myDevice["default_samplerate"],
            channels=aChannels,  
            blocksize=aBlockSize,  
            dtype="float32",
            callback=self.soundCaptureCallback
        )  

        self.myStream.start()
   

    @staticmethod 
    def getDevice(aRuleset): 
        theDevices = sd.query_devices() 
        theDevices = [aDevice for aDevice in theDevices if aRuleset.check(aDevice)] 
        if theDevices==[]:  raise ValueError(f"No Valid Device of Type: {type(aRuleset).__name__} !") 
        return theDevices[0] 
    
    #https://jakevdp.github.io/blog/2014/05/05/introduction-to-the-python-buffer-protocol/ 
    # indata is returned as an object that implements the Python buffer protocol.
    #
    # The buffer protocol is a c-level interface that allows objects to mess with eachother's underlying memory buffers.
    #
    # This is what the c-level code looks like under the hood
    #
    # typedef struct {
    #     void *buf;
    #     PyObject *obj;
    #     Py_ssize_t len;
    #     Py_ssize_t itemsize;
    #     int readonly;
    #     int ndim;
    #     char *format;
    #     Py_ssize_t *shape;
    #     Py_ssize_t *strides;
    #     Py_ssize_t *suboffsets;
    #     void *internal;
    # } Py_buffer;
    #
    # Libraries like numpy use this to create zero-copy array views, such as with np.frombuffer.
    def soundCaptureCallback(self, aInData, aFrames, aTime, aStatus): super().publish(np.frombuffer(aInData, dtype=np.uint8))

    def getSampleRate(self): return self.mySampleRate 
    
    def getChannels(self): return self.myChannels



    

    
        


    

    
