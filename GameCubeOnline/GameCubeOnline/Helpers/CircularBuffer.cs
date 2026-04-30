namespace GameCubeOnline.Helpers
{
    class CircularCounter
    {
        // Forces mycount to be updated accross multiple cpus instead of getting cached in a cache

        protected volatile int myCount;
        protected int myLimit;
        public CircularCounter(int aLimit, int aDefaultCount=0)
        {
            myCount = aDefaultCount%aLimit;
            myLimit = aLimit;
        }

        public static CircularCounter operator ++(CircularCounter aCounter)
        {
            aCounter.myCount = aCounter.peek();
            return aCounter;
        }

        public int peek() => (myCount + 1) % myLimit;

        public static bool operator ==(CircularCounter aCounterLeft, CircularCounter aCounterRight) => aCounterLeft.myCount == aCounterRight.myCount;
        public static bool operator !=(CircularCounter aCounterLeft, CircularCounter aCounterRight) => aCounterLeft.myCount != aCounterRight.myCount;

        public static implicit operator int(CircularCounter aCounter) => aCounter.myCount;


    }

    class CircularByteBuffer
    {
        // This Circular Byte Buffer is NOT thread safe, but is engineered to avoid concurrency issues as much as possible.
        // Peeks can only occur when the subscriber tail doesnt match the head. peek is reading an unfinished head, or goes beyond it. 
        // However, the head can silently overwrite the subscriber tail, even when the program is peeking since this structure is lockless. 
        // Fortuantely, by making the buffer big, we can give reasonable space between the tail and the head such that the head isnt overwriting the read.

        //https://learn.microsoft.com/en-us/archive/msdn-magazine/2018/january/csharp-all-about-span-exploring-a-new-net-mainstay 
        // Span<T> Structs are used as a way to get a view to contiguous memory. 
        // ex: var arr = new byte[10]; --> Span<byte> bytes = arr;  
        // Under the hood, they're really just a pointer to an array of values.
        // How many values its pointing to of a contiguous block is up to the user. This implies that you can also slice the view for better data manipulation.  
        // We use span over marshal since span is directly compiled by the JIT as opposed to marshal. 
        
        // Now instead of span, we can use memory, and in turn readOnlyMemory. 
        // ReadOnlyMemory is a small wrapper around span that can live on the heap.
        // More importantly it is await-safe, since readonlyspan lives on the stack and disappears on await.

        protected byte[] myBuffer;
        protected int[] mySizes;
        protected int myElementByteSize;
        protected int myElementCount;
        protected CircularCounter myHead; 
        public int HeadPosition { get => myHead; }

        public int Count { get => myElementCount; }
        public int ElementByteSize { get => myElementByteSize; }
        public CircularByteBuffer(int aElementByteSize, int aElementCount)
        {
            myHead = new CircularCounter(aElementCount);
            myElementByteSize = aElementByteSize;
            myElementCount = aElementCount;
            myBuffer = new byte[aElementCount * aElementByteSize];
            mySizes = new int[aElementCount]; 
        }

        protected void CopyDataIntoMyBuffer(ReadOnlyMemory<byte> aBuffer, int aOffset) {  aBuffer.CopyTo(myBuffer.AsMemory(aOffset, myElementByteSize)); }

        protected ReadOnlyMemory<byte> CopyDataOutToABuffer(int aOffset, int aSize) => myBuffer.AsMemory(aOffset, aSize);
        public void put(ReadOnlyMemory<byte> aBuffer, int aSize)
        {
            CopyDataIntoMyBuffer(aBuffer, myHead * myElementByteSize);
            mySizes[myHead] = aSize;
            myHead++;
        }

        public ReadOnlyMemory<byte>? peek(CircularCounter aCounter)
        {
            int theHead = myHead; // we need to snap shot head, the scheduler can slip in between the comparison between head and tail and cause concurrency issues. 
            if (aCounter == theHead) return null;
            ReadOnlyMemory<byte> theCopy = CopyDataOutToABuffer(aCounter * myElementByteSize, mySizes[aCounter]);
            aCounter++;
            return theCopy;
        }


    }
}
