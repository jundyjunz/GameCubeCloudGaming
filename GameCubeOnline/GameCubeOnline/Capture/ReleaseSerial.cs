using GameCubeOnline.Helpers;
using System.IO.Ports;

namespace GameCubeOnline.Capture
{
    class SerialWrapper
    {
        protected SerialPort myPort;
        protected int myBytesToWrite;
        protected byte[] myCurrentCommand;

        public int BytesToWrite { get => myBytesToWrite;  }
        public SerialWrapper(SerialPort aPort, int aBytesToWrite)
        {
            myPort = aPort;
            myBytesToWrite = aBytesToWrite;
            myCurrentCommand = new byte[aBytesToWrite];
            Task.Run(write);
        }

        public bool isDefaultCommand() {
            ReadOnlySpan<byte> theCommands = myCurrentCommand.AsSpan(1, myCurrentCommand.Length - 2);
            bool theIsDefaultCommand = true;
            foreach (var aCommand in theCommands) if (!(theIsDefaultCommand = aCommand == 0) ) break;
            return theIsDefaultCommand;
        }

        public void read(ReadOnlyMemory<byte> aBytes)
        {
            // concurrency issue here, writes can happen at the same time as reads. 
            // fortunately, crc8 checks will drop the packets arduino side if their bad. 
            // the scheduler also cannot be this malicious, as to schedule this many reads and writes at the same time.
            aBytes.CopyTo(myCurrentCommand.AsMemory(0, myBytesToWrite)); 
        }

        protected void writeCommand()
        {
            // if (isDefaultCommand()) return; --> this fails and stagnates the character to the last command. 
            // theres a check arduino side to see if theres incoming bytes. the reset only happens if there are incominhg bytes so it never reset the character.
            myPort.Write(myCurrentCommand, 0, myBytesToWrite);
        }

        public void write()
        {
            try { while (true) writeCommand(); }
            catch { myPort.Close(); myPort.Dispose(); }
        }


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


        protected bool tryConnect(string aPortName, byte aConnectCode, int aByteCommandLen, int aSleepBuffer = 2000)
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
            mySerialConnectionBuilt = (from aPortName
                                       in SerialPort.GetPortNames()
                                       select tryConnect(aPortName, aConnectCode, aByteCommandLen))
                                       .ToArray()
                                       .Any(aBool => aBool);
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
