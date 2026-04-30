using GameCubeOnline.Helpers;
using PortAudioSharp;
using System.Buffers;

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

        public int ChannelCount { get => myChannelCount; }
        public double SampleRate { get => mySampleRate; }

        public CaptureAudio(int aBufferSize, uint aFramesPerBuffer, int aChannelCount, int aSampleByteSize) : base((int)aFramesPerBuffer * aChannelCount * aSampleByteSize, aBufferSize)
        { // see build stream parameters for where magic numbers come fro,
            PortAudio.Initialize();
            myStream = null;
            myStreamParameters = default(StreamParameters);
            myFramesPerBuffer = aFramesPerBuffer;
            myChannelCount = aChannelCount;
            mySampleByteSize = aSampleByteSize;
            myIntToSampleFormatConversion = new Dictionary<int, SampleFormat>() { { 4, SampleFormat.Float32 } };
        }
        public override unsafe void publishToBuffer(IntPtr aPtr)
        {
            byte[] theTempBuffer = ArrayPool<byte>.Shared.Rent(myCircularByteBuffer.ElementByteSize); // new byte[myCircularByteBuffer.ElementByteSize];
            (new ReadOnlySpan<byte>((byte*)aPtr, myCircularByteBuffer.ElementByteSize)).CopyTo(theTempBuffer); 
            myCircularByteBuffer.put(new ReadOnlyMemory<byte>(theTempBuffer), myCircularByteBuffer.ElementByteSize);
            ArrayPool<byte>.Shared.Return(theTempBuffer);
        }
        protected int findDeviceId(CaptureAudioRuleSet aRuleSet)
        {
            for (int i = 0; i < PortAudio.DeviceCount; i++) if (aRuleSet.check(PortAudio.GetDeviceInfo(i))) return i;
            return -1;
        }

        public CaptureAudio buildStreamParameters(CaptureAudioRuleSet aRuleSet)
        {
            int theAudioId = findDeviceId(aRuleSet);
            if (theAudioId == -1) throw new Exception($"Audio Device {aRuleSet.RealName} Was Not Found!");
            myStreamParameters = new StreamParameters
            {
                device = theAudioId,
                channelCount = myChannelCount,
                sampleFormat = myIntToSampleFormatConversion.GetValueOrDefault(mySampleByteSize), // 4 bytes 
                suggestedLatency = PortAudio.GetDeviceInfo(theAudioId).defaultLowInputLatency
            };
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
                callback: (aInputPtr, aOutputPtr, aFrameCount, ref aTimeInfo, aStatusFlags, aUserData) => {
                    publishToBuffer(aInputPtr);
                    return StreamCallbackResult.Continue;
                },
                userData: null
            );
            return this;
        }



        public CaptureAudio buildInit()
        {
            (new BuilderWarning<CaptureAudio>())
            .requires(!myStreamParameters.Equals(default(StreamParameters)), nameof(buildStreamParameters))
            .requires(myStream != null, nameof(buildStream))
            .requires(myFrameRate != 0, nameof(buildFrameRate))
            .enforce();
            myStream.Start();
            return this;
        }


        public void Dispose()
        {
            myStream.Dispose();
        }
    }
}
