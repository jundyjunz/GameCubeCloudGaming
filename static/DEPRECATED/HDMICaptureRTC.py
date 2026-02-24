from aiortc import VideoStreamTrack 
from av import VideoFrame
import cv2 as cv
import time 
from fractions import Fraction  
import asyncio
#https://medium.com/@malieknath135/building-a-real-time-streaming-application-using-webrtc-in-python-d34694604fc4 
class HDMICaptureRTC(VideoStreamTrack): 
    def __init__(self, aCameraID):  
        super().__init__()
        self.myCapture = cv.VideoCapture(aCameraID)
        self.myNow = time.time() 
        self.myGenerator =self.generateFrame()
        self.myTimeStamp =0

    def generateFrame(self): 
        while True: 
            theIsSuccess, theFrame= self.myCapture.read()  
            if theIsSuccess: yield theFrame  
            else: continue  
    
    async def recv(self): 
        # using VideoFrame form AV to encode videoframes in a very specific format for webrtc 
        # using bgr24 since opencv is in bgr format. 
        # the 24 comes from 24 bits used to represent all colors. (8 bits+8 bits+8 bits)
        theFrame = VideoFrame.from_ndarray(next(self.myGenerator), format="bgr24")  
        #pts stands for Presentation Time Stamp.   
        #when the pts (frames) is multiplied by the time base (1/30s) you get the amount of seconds it should appear into the stream (the frame) 
        #self.myTimestamp doesn't mean anything on its own, but multiplying by a time base now gives it meaning. 
        #though we dont do this whatsoever.
        theFrame.pts=self.myTimeStamp
        self.myTimeStamp+=1
        theFrame.time_base=Fraction(1,30)

        return theFrame