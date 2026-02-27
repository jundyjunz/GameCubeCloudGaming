from Capture import Capture
class CaptureCollection: 
    def __init__(self, aCaptureList): 
        self.myCaptures = aCaptureList 
        self.myClientId=0
        self.validateAllArgsCapture() 

    def validateAllArgsCapture(self):
        if not all(list(map(lambda aCapture: isinstance(aCapture, Capture) ,self.myCaptures))): raise ValueError("A Value in the List is Not a Capture!") 
    
    def subscribeAll(self): 
        theClientidToReturn=self.myClientId 
        for aCapture in self.myCaptures: aCapture.subscribe(theClientidToReturn) 
        self.myClientId+=1 
        return theClientidToReturn 
    
    def unsubscibeAll(self, aClientId): 
        for aCapture in self.myCaptures: aCapture.unsubscribe(aClientId)  
        

