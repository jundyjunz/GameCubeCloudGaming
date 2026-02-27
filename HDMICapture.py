import cv2 as cv
import time 
import asyncio 
from Capture import Capture 
import threading
#https://stackoverflow.com/questions/63667466/video-streaming-app-using-fastapi-and-opencv
class HDMICapture(Capture): 
    def __init__(self, aCameraID, aFrameWidth, aFrameHeight, aImageQuality):  
        super().__init__(b"")
        self.myCapture = cv.VideoCapture(aCameraID);   
        self.myImageQuality=aImageQuality
        self.myFrameWidth = aFrameWidth 
        self.myFrameHeight = aFrameHeight   
        self.myThread = threading.Thread(target=self.beginFrameCollection, daemon=True ) #daemon indicates thread will die when program exits 
        self.myThread.start()

    def beginFrameCollection(self): 
        while True: 
            theIsSuccess, theFrame= self.myCapture.read()  
            if not theIsSuccess:continue
            theResizedFrame=cv.resize(theFrame, (self.myFrameWidth, self.myFrameHeight)) 
            theEncodedFrame=cv.imencode(".jpg",theResizedFrame, [cv.IMWRITE_JPEG_QUALITY, self.myImageQuality])[1]
            theFrameBytes = theEncodedFrame.tobytes()
            super().publishToAllSubscribers(theFrameBytes) 

   
    

    
                
