import queue
from NpCircularBuffer import NpCircularByteBuffer, CircularCounter
BUFFER_LEN=5
class Capture:
    def __init__(self, aMaxDataSize):
        self.mySubscribers={}
        self.myMaxDataSize=aMaxDataSize
        self.myCurrentClientId=0 
        self.myFrameBuffer=NpCircularByteBuffer(BUFFER_LEN, self.myMaxDataSize)

    def subscribe(self):  
        self.mySubscribers[self.myCurrentClientId]= CircularCounter(BUFFER_LEN)
        theReturnClientId=self.myCurrentClientId 
        self.myCurrentClientId+=1
        return theReturnClientId

    def unsubscribe(self, aClientId):  
        del self.mySubscribers[aClientId]
        return aClientId


    def publish(self, aData): 
        self.myFrameBuffer.put(aData)
    
    def getFrame(self, aClientId): 
        return self.myFrameBuffer.peek(self.mySubscribers[aClientId])
