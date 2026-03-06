import numpy as np
import threading
import multiprocessing as mp 
from multiprocessing import shared_memory as sm

class CircularCounter: 
    def __init__(self, aCircleCount:int, aStartingCount=0): 
        self.myCircleCount=aCircleCount 
        self.myCount=aStartingCount%aCircleCount

    def __call__(self): 
        return self.myCount 
    
    def __iadd__(self, aCountToAdd:int):
        assert aCountToAdd == 1 
        self.myCount=(self.myCount +1 ) %self.myCircleCount 
        return self 

    def __eq__(self, aOtherCircularCounter): 
        return self.myCount==aOtherCircularCounter.myCount 

class CircularCounterMultiProcessing: 
    def __init__(self, aCircleCount:int, aStartingCount=0): 
        assert 0<=aCircleCount<=255
        self.myCircleCount=aCircleCount 
        self.mySmCount = sm.SharedMemory(create=True, size=1)  
        self.myCount = np.ndarray(1,dtype=np.uint8, buffer=self.mySmCount.buf)
        self.myCount[0]=aStartingCount%aCircleCount

    def __call__(self): 
        return self.myCount[0]
    
    def __iadd__(self, aCountToAdd:int):
        assert aCountToAdd == 1 
        self.myCount[0]=(self.myCount[0] +0x01 ) %self.myCircleCount 
        return self 

    def __eq__(self, aOtherCircularCounter): 
        return self.myCount[0]==aOtherCircularCounter.myCount[0] 


class NpCircularBuffer:

    def __init__(self, aSize): 
        self.myHead=CircularCounter(aSize) 
        self.myTail=CircularCounter(aSize) 
        self.myBuffer=np.zeros(aSize, dtype=object)
        

    def get(self):  
        if self.myTail==self.myHead: return 0
        theReturnValue=self.myBuffer[self.myTail()] 
        self.myTail+=1 
        return theReturnValue

    def put(self, aValue): 
        self.myBuffer[self.myHead()]=aValue; 
        self.myHead+=1 

class NpCircularByteBuffer: 
    
    def __init__(self, aSize, aMaxDataBufferSize, aIsMultiProcessing=False):

        
        self.myHead=CircularCounterMultiProcessing(aSize) if aIsMultiProcessing else CircularCounter(aSize)

        self.mySmDefaultBuffer=sm.SharedMemory(create=True, size=aSize*aMaxDataBufferSize)if aIsMultiProcessing else None
        self.myDefaultBuffer =np.ndarray((aMaxDataBufferSize,), dtype=np.uint8, buffer=self.mySmDefaultBuffer.buf if aIsMultiProcessing else None)
        self.myDefaultBuffer.fill(0)

        self.mySmBuffer=sm.SharedMemory(create =True, size=aSize*aMaxDataBufferSize) if aIsMultiProcessing else None
        self.myBuffer=np.ndarray((aSize, aMaxDataBufferSize), dtype=np.uint8, buffer=self.mySmBuffer.buf if aIsMultiProcessing else None) 
        self.myBuffer.fill(0) 
        
        self.mySmBufferSizes=sm.SharedMemory(create=True, size=aSize*4)if aIsMultiProcessing else None
        self.myBufferSizes =np.ndarray((aSize,), dtype=np.uint32, buffer=self.mySmBufferSizes.buf if aIsMultiProcessing else None)  
        self.myBufferSizes.fill(0)

       
    
    def peek(self, aCircularcounter:CircularCounter): 
        #if aCircularcounter==self.myHead: return self.myDefaultBuffer
        theIdx=aCircularcounter()
        theBufferSize=self.myBufferSizes[theIdx]
        theDataBuffer=self.myBuffer[theIdx] 
        theCompressedBuffer=theDataBuffer[:theBufferSize] 
        aCircularcounter+=1
        return theCompressedBuffer 

    def put(self, aBuffer):  
        theDataBufferSize=len(aBuffer)
        self.myBuffer[self.myHead(), :theDataBufferSize]=aBuffer 
        self.myBufferSizes[self.myHead()]=theDataBufferSize
        self.myHead+=1
