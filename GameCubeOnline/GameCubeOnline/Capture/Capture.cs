using GameCubeOnline.Helpers;
namespace GameCubeOnline.Capture
{
    abstract class Capture<T> where T : class
    {
        protected CircularByteBuffer myCircularByteBuffer;
        protected Dictionary<int, CircularCounter> mySubscribers;
        protected int myNewestClientId;
        protected int myFrameRate;  
        protected Capture(int aElementByteSize, int aElementCount)
        {
            mySubscribers = new Dictionary<int, CircularCounter>();
            myCircularByteBuffer = new CircularByteBuffer(aElementByteSize, aElementCount);
            myNewestClientId = 0;
        }

        public int subscribeToBuffer()
        {
            int theOldSubscriberCount = myNewestClientId;
            mySubscribers[myNewestClientId++] = new CircularCounter(myCircularByteBuffer.Count, myCircularByteBuffer.HeadPosition);
            return theOldSubscriberCount;
        }

        public int unsubscribeFromBuffer(int aClientId)
        {
            mySubscribers.Remove(aClientId);
            return aClientId;
        }

        public abstract void publishToBuffer(IntPtr aPtr);
        public ReadOnlyMemory<byte>? readFromBuffer(int aClientId) => myCircularByteBuffer.peek(mySubscribers[aClientId]);

        public T buildFrameRate(int aFrameRateInMs) {
      
            myFrameRate = aFrameRateInMs;
            return this as T;
        }


    }
}
