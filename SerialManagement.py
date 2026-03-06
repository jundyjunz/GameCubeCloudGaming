import serial  
import serial.tools.list_ports
import time
import queue 
import threading

BAUDRATE=115200
IDN_COMMAND='#' 
IDN="GCN_ADAPTOR" 
TIMEOUT=1 
WRITE_TIMEOUT=1
class SerialWrapper: 
    def __init__(self, aSerialConnection: serial.Serial): 
        self.mySerialConnection=aSerialConnection  
        # no circular buffer here, we dont want to write faster (python side) and over flow the arduino buffer  
        # it would make things very messy.  
        # while we could certainly just have a time.sleep(), this is more reliable since we have built in threading protection in case 
        # more than one person takes control of acontroller. 
        theThread = threading.Thread(target=self.startWrite, daemon=True)
        self.mySerialQueue =queue.Queue(maxsize=50) 
        theThread.start()

    def put(self, aBytes):   
        if(self.mySerialQueue.full()): self.mySerialQueue.get()
        self.mySerialQueue.put(aBytes) 

    def startWrite(self): 
        while True:
            theCommand = self.mySerialQueue.get() 
            if theCommand==b"": continue
            self.mySerialConnection.write(theCommand) 

class SerialManager: 
    def __init__(self): 
        self.mySerialConnections=[]

        theComPorts = serial.tools.list_ports.comports()  
        for aComPort in theComPorts: 
            try:
                theSerialConnection= serial.Serial( 
                    port=aComPort.device,  
                    baudrate=BAUDRATE,  
                    timeout=TIMEOUT,  
                    write_timeout=WRITE_TIMEOUT
                )  
            except: continue

            if theSerialConnection.is_open: 
                # https://stackoverflow.com/questions/65224676/why-wont-pyserial-write-inside-of-my-program  
                # https://stackoverflow.com/questions/37824371/python-serial-write-doesnt-work-first-run 
                # https://www.reddit.com/r/arduino/comments/zkxwv1/reset_when_serial_disconnected_and_reconnected/  
                # TLDR: arduino resets itself when serial is established, so we need a delay 
                # You can supposedly bypass this by accessing a register on the chip, or soldering some pads
                time.sleep(2) 
                theSerialConnection.reset_input_buffer()# reset input buffer to avoid random garbage
                try: 
                    theSerialConnection.write(IDN_COMMAND.encode("utf-8")) 
  
                except: 
                    print(f"Port: {aComPort.device} Connection Failed.") 
                    continue

                theResponse = theSerialConnection.readline().decode('utf-8').strip() 
                if theResponse==IDN:  
                    self.mySerialConnections.append(SerialWrapper(theSerialConnection)) 
                    print(f"Port: {aComPort.device} Connection Successful.")


    def getSerialConnectionsAmt(self): 
        return len(self.mySerialConnections) 
    
    def __getitem__(self, key:int):  
        assert isinstance(key, int)
        return self.mySerialConnections[key]