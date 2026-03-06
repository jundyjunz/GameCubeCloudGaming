import cv2 as cv
import time 
import asyncio 
from Capture import Capture 
import multiprocessing as mp
#https://stackoverflow.com/questions/63667466/video-streaming-app-using-fastapi-and-opencv
class HDMICapture(Capture): 
    def __init__(self, aCameraID, aFrameWidth, aFrameHeight, aImageQuality):  
        super().__init__(aFrameWidth*aFrameHeight*3, True)
        self.myCapture = None 
        self.myCameraID = aCameraID  
        self.myImageQuality=aImageQuality
        self.myFrameWidth = aFrameWidth 
        self.myFrameHeight = aFrameHeight   
        self.myProcess= mp.Process(target=self.beginFrameCollection, daemon=True ) #daemon indicates process will die when program exits 
        self.myProcess.start()


    def beginFrameCollection(self): 
        self.myCapture=cv.VideoCapture(self.myCameraID);  
        while True: 
            theIsSuccess, theFrame= self.myCapture.read()  
            if not theIsSuccess:continue
            theResizedFrame=cv.resize(theFrame, (self.myFrameWidth, self.myFrameHeight)) 
            theEncodedFrame=cv.imencode(".jpg",theResizedFrame, [cv.IMWRITE_JPEG_QUALITY, self.myImageQuality])[1]
            super().publish(theEncodedFrame) 
            time.sleep(1/60) #cap at 60 frames a second, needed to give control back to the OS scheduler
        

   
        
    
    
                
