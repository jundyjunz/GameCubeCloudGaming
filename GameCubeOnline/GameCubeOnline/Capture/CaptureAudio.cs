using GameCubeOnline.Helpers;
using PortAudioSharp;
using System.Buffers;
using System.Runtime.InteropServices;

namespace GameCubeOnline.Capture
{
    class CaptureAudio : Capture<CaptureAudio>, Builder<CaptureAudio>, IDisposable
    {
        protected uint myFramesPerBuffer;
        protected int myChannelCount;
        protected int mySampleByteSize;
        protected double mySampleRate;
        protected int mySampleFormat;
        protected PortAudioSharp.Stream myStream;
        protected StreamParameters myStreamParameters;
        protected Dictionary<int, SampleFormat> myIntToSampleFormatConversion; 
        protected byte[] myLowResTempBuffer;
        protected int myLowResScalingFactor;
        public int ChannelCount { get => myChannelCount; }
        public double SampleRate { get => mySampleRate; } 
        public int LowResFramesPerBuffer { get => (int)((myFramesPerBuffer * myChannelCount * mySampleByteSize) / myLowResScalingFactor); }
        public CaptureAudio(int aBufferSize, uint aFramesPerBuffer, int aChannelCount, int aSampleByteSize) : base((int)aFramesPerBuffer * aChannelCount * aSampleByteSize, aBufferSize)
        { // see build stream parameters for where magic numbers come from,
            PortAudio.Initialize();
            myStream = null;
            myStreamParameters = default(StreamParameters);
            myFramesPerBuffer = aFramesPerBuffer;
            myChannelCount = aChannelCount;
            mySampleByteSize = aSampleByteSize;
            myIntToSampleFormatConversion = new Dictionary<int, SampleFormat>() { { 4, SampleFormat.Float32 } };
            myLowResTempBuffer = null;
            myLowResScalingFactor = -1;  
        }

        // sample needs to be limited, it is a ratio but it can sometimes fall out of the maximu and minimum ranges
        // then we multiply the ratio by the max value of int
        protected int convertFloatSampleToInt(float aFloatSample) => (int)(Math.Clamp(aFloatSample, -1.0f, 1.0f) * int.MaxValue);  
       

        public override unsafe void publishToBuffer(IntPtr aPtr)
        {
            (new ReadOnlySpan<byte>((byte*)aPtr, myCircularByteBuffer.ElementByteSize)).CopyTo(myTempBuffer); 
            myCircularByteBuffer.put(new ReadOnlyMemory<byte>(myTempBuffer), myCircularByteBuffer.ElementByteSize);
            
            if (myLowResCircularByteBuffer == null) return;

            ReadOnlySpan<float> theFloatSamples = MemoryMarshal.Cast<byte, float>(myTempBuffer); //reinterpret as float samples, but only as a view 
            Span<int> theLowResTempBufferAsIntBuffer = MemoryMarshal.Cast<byte, int>(myLowResTempBuffer.AsSpan());
            for (int i = 0; i < theFloatSamples.Length; i+=myLowResScalingFactor) theLowResTempBufferAsIntBuffer[i/myLowResScalingFactor] = convertFloatSampleToInt(theFloatSamples[i]);
            myLowResCircularByteBuffer.put(new ReadOnlyMemory<byte>(myLowResTempBuffer), myLowResCircularByteBuffer.ElementByteSize);

        }

        protected int findDeviceId(CaptureAudioRuleSet aRuleSet)
        {
            for (int i = 0; i < PortAudio.DeviceCount; i++) if (aRuleSet.check(PortAudio.GetDeviceInfo(i))) return i;
            return -1;
        }

        public override CaptureAudio buildLowResStream(params object[] aArgs)
        {
            if (myStream == null) throw new Exception("Original Stream Has Not Yet Been Created! Cannot Make Low Res Stream!");
            
            int theBufferSize = (int)aArgs[0];
            int theChannelCount = (int)aArgs[1];

            myLowResScalingFactor = myChannelCount / theChannelCount;
            int theAudioFrameSize = myCircularByteBuffer.ElementByteSize / myLowResScalingFactor;
            myLowResCircularByteBuffer = new CircularByteBuffer(theAudioFrameSize, theBufferSize);
            myLowResTempBuffer = new byte[theAudioFrameSize];
            
            return this;
        }
        public CaptureAudio buildStreamParameters(CaptureAudioRuleSet aRuleSet)
        {
            int theAudioId = findDeviceId(aRuleSet);
            if (theAudioId == -1) throw new Exception($"Audio Device {aRuleSet.RealName} Was Not Found!");

            myStreamParameters = new StreamParameters();
            myStreamParameters.device = theAudioId;
            myStreamParameters.channelCount = myChannelCount;
            myStreamParameters.sampleFormat = myIntToSampleFormatConversion.GetValueOrDefault(mySampleByteSize); // 4 bytes 
            myStreamParameters.suggestedLatency = PortAudio.GetDeviceInfo(theAudioId).defaultLowInputLatency;
            
            return this;
        }

        public CaptureAudio buildStream()
        {
            mySampleRate = PortAudio.GetDeviceInfo(myStreamParameters.device).defaultSampleRate;
            myStream = new PortAudioSharp.Stream(
                inParams: myStreamParameters,
                outParams: null,
                sampleRate: mySampleRate,
                framesPerBuffer: myFramesPerBuffer,
                streamFlags: StreamFlags.NoFlag,
                callback: (aInputPtr, aOutputPtr, aFrameCount, ref aTimeInfo, aStatusFlags, aUserData) => { publishToBuffer(aInputPtr); return StreamCallbackResult.Continue; },
                userData: null );
            return this;
        }

        public CaptureAudio buildInit()
        {
            (new BuilderWarning<CaptureAudio>())
            .requires(!myStreamParameters.Equals(default(StreamParameters)), nameof(buildStreamParameters))
            .requires(myStream != null, nameof(buildStream))
            .requires(myFrameRate != 0, nameof(buildFrameRate))
            .enforce();
            myStream!.Start();
            return this;
        }

        public void Dispose()
        {
            myStream.Dispose();
        }
    }
}
