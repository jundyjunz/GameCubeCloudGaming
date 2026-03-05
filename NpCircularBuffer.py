import numpy as np
import threading

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
    
    def __init__(self, aSize, aMaxDataBufferSize): 
        self.myHead=CircularCounter(aSize) 
        self.myBuffer=np.zeros((aSize, aMaxDataBufferSize), dtype=np.uint8) 
        self.myBufferSizes =np.zeros(aSize, dtype=np.uint32) 
        self.myDefaultBuffer =np.zeros((aSize, aMaxDataBufferSize), dtype=np.uint8)
    
    def getHeadValue(self): 
        return self.myHead()
    
    def peek(self, aCircularcounter:CircularCounter): 
        if aCircularcounter==self.myHead: return self.myDefaultBuffer
        theBufferSize=self.myBufferSizes[aCircularcounter()]
        theDataBuffer=self.myBuffer[aCircularcounter()] 
        theCompressedBuffer=theDataBuffer[:theBufferSize] 
        aCircularcounter+=1
        return theCompressedBuffer 

    def put(self, aBuffer):  
        theDataBufferSize=len(aBuffer)
        self.myBuffer[self.myHead(), :theDataBufferSize]=aBuffer 
        self.myBufferSizes[self.myHead()]=theDataBufferSize
        self.myHead+=1
