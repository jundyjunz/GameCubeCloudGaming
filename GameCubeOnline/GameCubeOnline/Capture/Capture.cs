using GameCubeOnline.Helpers;
namespace GameCubeOnline.Capture
{
    abstract class Capture<T> where T : class
    {

        public enum CaptureQuality { LOW, STANDARD };
        protected CircularByteBuffer myCircularByteBuffer;
        protected CircularByteBuffer myLowResCircularByteBuffer;
        protected Dictionary<int, CircularCounter> mySubscribers;
        protected int myNewestClientId;
        protected int myFrameRate;
        protected byte[] myTempBuffer; // this is needed for when data is transfered from the audio/video driver to the circular buffer

        protected Capture(int aElementByteSize, int aElementCount)
        {
            mySubscribers = new Dictionary<int, CircularCounter>();
            myCircularByteBuffer = new CircularByteBuffer(aElementByteSize, aElementCount);
            myLowResCircularByteBuffer = null;
            myNewestClientId = 0;
            myTempBuffer = new byte[aElementByteSize];
        }

        public int subscribeToBuffer(CaptureQuality aCaptureQuality = CaptureQuality.STANDARD)
        {
            int theOldSubscriberCount = myNewestClientId;
            mySubscribers[myNewestClientId++] = aCaptureQuality == CaptureQuality.STANDARD ? new CircularCounter(myCircularByteBuffer.Count, myCircularByteBuffer.HeadPosition) :
                                                aCaptureQuality == CaptureQuality.LOW && myLowResCircularByteBuffer!=null ? new CircularCounter(myLowResCircularByteBuffer.Count, myLowResCircularByteBuffer.HeadPosition) : 
                                                throw new Exception($"A Buffer Specified by The Enum \"{aCaptureQuality.ToString()}\" Has Not Been Initialized...") ;
            return theOldSubscriberCount;
        }

        public int unsubscribeFromBuffer(int aClientId)
        {
            mySubscribers.Remove(aClientId);
            return aClientId;
        }

        public abstract void publishToBuffer(IntPtr aPtr);
        public ReadOnlyMemory<byte>? readFromBuffer(int aClientId, CaptureQuality aCaptureQuality = CaptureQuality.STANDARD)
        {
            return aCaptureQuality == CaptureQuality.STANDARD ? myCircularByteBuffer.peek(mySubscribers[aClientId]) :
                   aCaptureQuality == CaptureQuality.LOW && myLowResCircularByteBuffer != null ? myLowResCircularByteBuffer.peek(mySubscribers[aClientId]):
                   throw new Exception($"A Buffer Specified by The Enum \"{aCaptureQuality.ToString()}\" Has Not Been Initialized...");

        }
        public abstract T buildLowResStream(params object[] aArgs);

        public T buildFrameRate(int aFrameRateInMs) {
      
            myFrameRate = aFrameRateInMs;
            return this as T;
        }


    }
}
