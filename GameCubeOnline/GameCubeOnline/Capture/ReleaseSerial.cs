using GameCubeOnline.Helpers;
using System.Buffers;
using System.IO.Ports;

namespace GameCubeOnline.Capture
{
    class SerialWrapper
    {
        protected SerialPort myPort;
        protected int myBytesToWrite;
        protected Dictionary<int, byte[]> myCurrentCommands;
        protected byte[] myCoalescedCommand;
        protected Lock myCommandLock;
        protected Lock mySubscriberLock;
        protected static byte myPolynomialMultiplier = 0xFA;
        protected int myNewestClientId;

        public int BytesToWrite { get => myBytesToWrite;  }
        public SerialWrapper(SerialPort aPort, int aBytesToWrite)
        {
            myPort = aPort;
            myBytesToWrite = aBytesToWrite;
            myCommandLock = new Lock();
            mySubscriberLock = new Lock();
            myCurrentCommands = new Dictionary<int, byte[]>(); 
            myCoalescedCommand = new byte[myBytesToWrite];
            myNewestClientId = 0;
            Task.Run(write);
        }

        protected byte crc8(ReadOnlySpan<byte> theBytes)
        {
            byte theEvolvingCRC = 0x00;
            for (int i = 0; i < theBytes.Length; i++)
            {
                byte theCurrentByte = theBytes[i];
                for (int j = 0; j < 8; j++)
                {
                    int theAreBothBitsDifferent = (theEvolvingCRC ^ theCurrentByte) & 0x01;
                    theEvolvingCRC >>= 1;
                    if (theAreBothBitsDifferent==1) theEvolvingCRC ^= myPolynomialMultiplier;
                    theCurrentByte >>= 1;
                }
            }
            return theEvolvingCRC;
        }

        protected void byteArrayOrEquals(byte[] aByteArr1, byte[] aByteArr2) { 
            if (aByteArr1.Length == aByteArr2.Length) for (int i = 0; i < aByteArr1.Length; i++) { aByteArr1[i] |= aByteArr2[i]; }
        }

        protected void resetCoalescedCommandToDefault() => myCoalescedCommand.AsSpan(1, myBytesToWrite-2).Fill(0x00);


        public int subscribeToPort(){
            // needed such that the enumeration while looping through the subscribers to coalesce the command doesnt fail.
            // Fine to have a lock in this case since contention is rare. Only happens upon connection.
            lock (mySubscriberLock){
                int theOldSubscriberCount = myNewestClientId;
                myCurrentCommands[myNewestClientId++] = new byte[myBytesToWrite];
                return theOldSubscriberCount;
            }
        }

        public int unsubscribeFromPort(int aClientId){
            lock (mySubscriberLock) myCurrentCommands.Remove(aClientId);
            return aClientId;
        }

        public void readCommand(ReadOnlyMemory<byte> aBytes, int aClientId) { lock (myCommandLock) aBytes.CopyTo(myCurrentCommands[aClientId]); } 
        protected void writeCommand()
        {
            lock (mySubscriberLock) foreach (var aCommand in myCurrentCommands) byteArrayOrEquals(myCoalescedCommand, aCommand.Value); //coalescing commands
            myCoalescedCommand[myBytesToWrite - 1] = crc8(myCoalescedCommand.AsSpan(0, myBytesToWrite-1));
            myPort.Write(myCoalescedCommand, 0, myBytesToWrite);
            resetCoalescedCommandToDefault(); // have to reset command every time so stale command doesnt persist
        }
        public void write(){ while (true) { writeCommand(); Thread.Sleep(1);  } } // minimum thread stall so as not to hog the CPU.

        


    }
    class ReleaseSerial : Builder<ReleaseSerial>, IDisposable
    {
        protected int myBaudRate;
        protected int myReadTimeout;
        protected int myWriteTimeout;
        protected List<SerialWrapper> myPorts;
        protected bool mySerialConnectionBuilt; 

        public int PortCount { get => myPorts.Count; } 

        public SerialWrapper this[int aIndex] { get => myPorts[aIndex];}

        public ReleaseSerial()
        {
            myBaudRate = 0;
            myReadTimeout = 0;
            myWriteTimeout = 0;
            myPorts = new List<SerialWrapper>();
            mySerialConnectionBuilt = false;
        }


        protected bool registerPort(SerialPort aPort, int aByteCommandLen)
        {
            myPorts.Add(new SerialWrapper(aPort, aByteCommandLen));
            Console.WriteLine($"Successfully Registered Port {aPort.PortName}");
            return true;
        }


        protected bool tryConnect(string aPortName, byte aConnectCode, int aByteCommandLen, int aSleepBuffer = 2000, int aWaitBuffer=500)
        {
            Console.WriteLine($"Attempting To Connect To Port {aPortName} ");
            SerialPort thePort = new SerialPort(aPortName, myBaudRate);
            try
            {
                thePort.ReadTimeout = myReadTimeout;
                thePort.WriteTimeout = myWriteTimeout;
                byte[] theMessageToWrite = [aConnectCode];
                byte[] theMessageToRead = new byte[1];
                thePort.DtrEnable = true;// resets the arduino to pre flashed state.
                thePort.Open();
                Thread.Sleep(aSleepBuffer);
                thePort.DiscardInBuffer();
                thePort.Write(theMessageToWrite, 0, 1);
                Thread.Sleep(aWaitBuffer); // need to wait a bit here so we can wait for the I/O request.
                thePort.Read(theMessageToRead, 0, 1);
                if (theMessageToRead[0] == theMessageToWrite[0]) return registerPort(thePort, aByteCommandLen);
                thePort.Close();
                thePort.Dispose();
                return false;

            }
            catch (Exception theException)
            {
                Console.WriteLine(theException.Message);
                if (thePort.IsOpen) thePort.Close();
                thePort.Dispose();
                return false;
            }
        }


        public ReleaseSerial buildBaudRate(int aBaudRate)
        {
            myBaudRate = aBaudRate;
            return this;
        }
        public ReleaseSerial buildWriteTimeout(int aWriteTimeout)
        {
            myWriteTimeout = aWriteTimeout;
            return this;
        }
        public ReleaseSerial buildReadTimeout(int aReadTimeout)
        {
            myReadTimeout = aReadTimeout;
            return this;
        }


        public ReleaseSerial buildSerialConnection(byte aConnectCode, int aByteCommandLen)
        {
            mySerialConnectionBuilt = SerialPort.GetPortNames().Select (aPortName=> tryConnect(aPortName, aConnectCode, aByteCommandLen)).ToArray().Any(aBool => aBool);
            return this;
        }



        public ReleaseSerial buildInit()
        {
            (new BuilderWarning<ReleaseSerial>())
            .requires(myBaudRate != 0, nameof(buildBaudRate))
            .requires(myReadTimeout != 0, nameof(buildReadTimeout))
            .requires(myWriteTimeout != 0, nameof(buildWriteTimeout))
            .requires(mySerialConnectionBuilt != false, nameof(buildSerialConnection), "Baud Rate and Read/Write Timeouts need to be Set Before this! ")
            .enforce();

            return this;
        }

        public void Dispose() { }
    }
}
