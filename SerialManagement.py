import serial  
import serial.tools.list_ports
import time
import threading

BAUDRATE=250000
HANDSHAKE_VALUE = bytes([0xFA]) # bytes constructor expects iterable integer hence the name bytes (plural)
TIMEOUT=1 
WRITE_TIMEOUT=1
class SerialWrapper: 
    def __init__(self, aSerialConnection: serial.Serial): 
        self.mySerialConnection=aSerialConnection  
        # no circular buffer here, we dont want to write faster (python side) and over flow the arduino buffer  
        # it would make things very messy.  
        
        self.myCurrentBytes=b""
        theThread = threading.Thread(target=self.startWrite, daemon=True) 
        theThread.start()
        

    def put(self, aBytes):   
        self.myCurrentBytes=aBytes

    def startWrite(self): 
        while True:
            if self.myCurrentBytes==b"": continue
            self.mySerialConnection.write(self.myCurrentBytes) 

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
            
                if theSerialConnection.is_open: 
                    # https://stackoverflow.com/questions/65224676/why-wont-pyserial-write-inside-of-my-program  
                    # https://stackoverflow.com/questions/37824371/python-serial-write-doesnt-work-first-run 
                    # https://www.reddit.com/r/arduino/comments/zkxwv1/reset_when_serial_disconnected_and_reconnected/  
                    # TLDR: arduino resets itself when serial is established, so we need a delay 
                    # You can supposedly bypass this by accessing a register on the chip, or soldering some pads
                    time.sleep(2)
                    theSerialConnection.reset_input_buffer()# reset input buffer to avoid random garbage
                    try: theSerialConnection.write(HANDSHAKE_VALUE)   
    
                    except: 
                        print(f"Port: {aComPort.device} Connection Failed.") 
                        continue

                    if theSerialConnection.read(1)==HANDSHAKE_VALUE:  
                        self.mySerialConnections.append(SerialWrapper(theSerialConnection)) 
                        print(f"Port: {aComPort.device} Connection Successful.")

            except: continue

    def getSerialConnectionsAmt(self): 
        return len(self.mySerialConnections) 
    
    def __getitem__(self, key:int):  
        assert isinstance(key, int)
        return self.mySerialConnections[key]