import queue

class Capture:
    def __init__(self, aDefaultPacket):
        self.mySubscribers={}
        self.myFrameQueues=[]
        self.myDefaultPacket=aDefaultPacket 
        self.myCurrentClientId=0

    def subscribe(self):  
        self.myFrameQueues.append(queue.Queue(maxsize=10))
        self.mySubscribers[self.myCurrentClientId]=len(self.myFrameQueues)-1 
        theReturnClientId=self.myCurrentClientId 
        self.myCurrentClientId+=1
        return theReturnClientId

    def unsubscribe(self, aClientId):  
        del self.myFrameQueues[-1] 
        del self.mySubscribers[aClientId]
        self.reassignSubscriberQueues()
        return aClientId

    def reassignSubscriberQueues(self):
        theIndex=0 
        theSubscriberClientIds=self.mySubscribers.keys()
        for aClientId in theSubscriberClientIds: 
            self.mySubscribers[aClientId]=theIndex 
            theIndex+=1

    def publishToAllSubscribers(self, aData): 
        for aQueue in self.myFrameQueues: 
            if (aQueue.full()): aQueue.get_nowait()
            aQueue.put_nowait(aData)
    
    def getFrame(self, aClientId): 
        theQueue=self.myFrameQueues[self.mySubscribers[aClientId]]
        if theQueue.empty(): return self.myDefaultPacket
        return theQueue.get_nowait()