namespace GameCubeOnline.Helpers
{ 
    /*!
     * @brief CircularCounter  
     * 
     * A counter that loops around itself at a specified value. 
     * It can be implicitly converted to int if need be.  
     * You can also set a value to have it start counting at, but it is by default 0.
     *  
     * Example Usage: 
     * 
     * @code
     * var theCounter CircularCounter(10, 9); 
     * theCounter++; 
     * int theNum = theCounter // theNum=0; 10%10 = 0.
     * @endcode
     * 
     */
    class CircularCounter
    {

        protected volatile int myCount; /*!< The internal count of the CircularCounter. It is volatile to force the update of the counter accross multiple CPUs if need be.  */
        protected int myLimit;          /*!< the limit of the internal counter. Adding past this point will reset the count back to 0.*/

        /*! 
         *  @brief Constructor. Sets the myLimit and myCount Variables.
         *  
         *  @param aLimit The Limit you want To Set.
         *  @param aDefaultCount The Number You Want To Start Counting at. Set to 0 by Default.
         */
        public CircularCounter(int aLimit, int aDefaultCount=0)
        {
            myCount = aDefaultCount%aLimit;
            myLimit = aLimit;
        }


        /*! 
         *  @brief ++ operator. Adds 1 to the circular counter.
         *  
         *  @param aCounter the CircularCounter you want to add to.  
         *  
         *  @returns the circular counter instance you are operating on.
         *  
         *  @note C# operators are static, and operate on an instance.  
         *  @note This is unlike the regular ++ postfix operator. It will act more like the prefix ++ operator. 
         */
        public static CircularCounter operator ++(CircularCounter aCounter)
        {
            aCounter.myCount = aCounter.peek();
            return aCounter;
        }

        /*! 
         *  @brief peek. Gets the next number the circular counter is supposed to be after a ++.
         *  
         *  @returns the int representing the next number the CircularCounter will advance to.
         */
        public int peek() => (myCount + 1) % myLimit;

        /*! 
        *  @brief == operator. Checks if the two myCounts are equivalent to eachother. 
        *   
        *  @param aCounterLeft the CircularCounter on the left side of ==
        *  
        *  @param aCounterRight the CircularCounter on the right side of ==
        *  
        *  @returns a bool seeing if the internal counts are the same. 
        *   
        *  @note since the implicit int operator exists this may be redundant.
        */

        public static bool operator ==(CircularCounter aCounterLeft, CircularCounter aCounterRight) => aCounterLeft.myCount == aCounterRight.myCount;

        /*! 
        *  @brief != operator. Checks if the two myCounts are not equivalent to eachother.
        *  
        *  @param aCounterLeft the CircularCounter on the left side of !=
        *  
        *  @param aCounterRight the CircularCounter on the right side of !=
        *  
        *  @returns a bool seeing if the internal counts are not the same. 
        *   
        *  @note since the implicit int operator exists this may be redundant.
        */
        public static bool operator !=(CircularCounter aCounterLeft, CircularCounter aCounterRight) => aCounterLeft.myCount != aCounterRight.myCount;


        /*! 
        *  @brief implicit int operator. Converts to int when used as one. The value is the value of myCount. 
        *   
        *  @param aCounter theCircularCounter you want to transform into an int.
        *  
        *  @returns a bool seeing if the internal counts are not the same. 
        *   
        *  @note since the implicit int operator exists this may be redundant.
        */
        public static implicit operator int(CircularCounter aCounter) => aCounter.myCount;


    }

    /*!
     * @brief CircularByteBuffer
     * 
     * A circular buffer. 
     * Its slightly different than a normal circular buffer in the sense that it also records the ACTUAL size of the element you put in. 
     * Though its partitioned at the maximum size that element can be. 
     * Peek is slightly different than pop as well. 
     * Peek takes in circular counter from a reader and uses it as its tail for that reader, making sure it doesn't pass the head. 
     * 
     * @code  
     * var theBuffer = CircularByteBuffer(10, 200). 
     * byte[] theBytes = new byte[200]; 
     * theBytes[0]='b'; 
     * theBytes[1]='i';
     * theBuffer.put(theBytes.AsMemory, 2); // head advanced to position 1 
     * var theCounter = CircularCounter(10,0);
     * ReadOnlyMemory<byte>? theNewBuffer = theBuffer.peek(theCounter); // tail reads at 0. The new buffer is ['b','i']
     * @endcode
     * 
     * 
     * @warning CircularByteBuffer is NOT thread safe. 
     * The head can silently overwrite the tail. BUT the Tail cannot overwrite the head.  
     * It is engineered like this to prioritize giving you the most recent frame, rather than to have smooth playback. 
     * Fortunately, making the buffer large enough avoids concurrency issues, which gives smooth playback in the end.
     * 
     */
    class CircularByteBuffer
    {
        
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
