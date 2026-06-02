from Pippy import Pippy

thePippy = Pippy(["sounddevice"], lambda : print("Pippy Had Nothing To Install.")) 
thePippy.fetch()

import sounddevice as sd

class DeviceWrapper: 
    def __init__(self, aDevice): 
        self.myDevice=aDevice 

    def __eq__(self, aOtherDevice):
        theConditions = [ 
            self.myDevice["name"]                       ==aOtherDevice["name"],
            self.myDevice["hostapi"]                    ==aOtherDevice["hostapi"],
            self.myDevice["max_input_channels"]         ==aOtherDevice["max_input_channels"],
            self.myDevice["max_output_channels"]        ==aOtherDevice["max_output_channels"],
            self.myDevice["default_low_input_latency"]  ==aOtherDevice["default_low_input_latency"],
            self.myDevice["default_low_output_latency"] ==aOtherDevice["default_low_output_latency"],
            self.myDevice["default_high_input_latency"] ==aOtherDevice["default_high_input_latency"],
            self.myDevice["default_high_output_latency"]==aOtherDevice["default_high_output_latency"],
            self.myDevice["default_samplerate"]         ==aOtherDevice["default_samplerate"] 
        ] 
        return all(theConditions) 
    
    def __str__(self): 
        return "\n".join([f"{aKey}: {self.myDevice[aKey]}" for aKey in self.myDevice]) 
    
    def __getitem__(self, aStr): 
        return self.myDevice[aStr]


input("Welcome To Sound Device Finder! Press Any Key To Scan For All Hardware.")
theAllDevices = [DeviceWrapper(aDevice) for aDevice in sd.query_devices()]   
input("Sound Devices Scanned! Please Unplug the Device You Want Information For! Then Press Any Key To Continue")
sd._terminate()
sd._initialize()
theAllDevicesButOne = [DeviceWrapper(aDevice) for aDevice in sd.query_devices()]  
theDevicesToFind= [str(aDevice) for aDevice in theAllDevices if aDevice not in theAllDevicesButOne]  
if len(theDevicesToFind)>0: print( "Devices Found: \n"+ "\n\n".join(theDevicesToFind) )  
else: print("No Device Found...") 



        


    
   



    

    
        


    

    
