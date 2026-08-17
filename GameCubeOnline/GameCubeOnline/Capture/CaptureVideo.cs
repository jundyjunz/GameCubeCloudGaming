using GameCubeOnline.Helpers;
using OpenCvSharp;

namespace GameCubeOnline.Capture
{
    class CaptureVideo : Capture<CaptureVideo>, Builder<CaptureVideo>, IDisposable
    {
        protected VideoCapture myVideoCapture;
        protected Size mySize;
        protected Size myLowResSize;
        protected Mat myFrame;
        protected Mat myResizedFrame;
        protected Mat myLowResResizedFrame;
        protected ImageEncodingParam[] myVideoQuality;

        protected ImageEncodingParam[] myLowResVideoQuality;

        public CaptureVideo(int aBufferSize, int aFrameWidth, int aFrameHeight) : base(aFrameWidth * aFrameHeight * 3 , aBufferSize) // x3 for each rgb channel
        {
            myVideoQuality = null;
            myVideoCapture = null;
            mySize = new Size(aFrameWidth, aFrameHeight);
            myFrame = new Mat();
            myResizedFrame = new Mat();
            myLowResResizedFrame = null;
            myLowResSize = default;
        }

        public CaptureVideo buildVideoSource(int aVideoSource)
        {
            VideoCaptureAPIs thePlatform = OperatingSystem.IsWindows() ? VideoCaptureAPIs.DSHOW
                                          : OperatingSystem.IsMacOS() ? VideoCaptureAPIs.AVFOUNDATION
                                          : VideoCaptureAPIs.V4L2;

            myVideoCapture = new VideoCapture(aVideoSource, thePlatform);
            return this;

        }

        public CaptureVideo buildVideoQuality(int aVideoQuality, bool aUseHuffmanOptimization, bool aUseProgressiveScan)
        {
            myVideoQuality = new ImageEncodingParam[] {
                new ImageEncodingParam(ImwriteFlags.JpegQuality, aVideoQuality),
                new ImageEncodingParam(ImwriteFlags.JpegOptimize, aUseHuffmanOptimization?1:0), // Shrinks the size of the file using huffman tables
                new ImageEncodingParam(ImwriteFlags.JpegProgressive, aUseProgressiveScan?1:0) // helps shrink the file size by loading the image in multiple passes, low quality at first
            };
            return this;
        }

        protected void processFrame( Mat aDestFrame, Size aSize, CircularByteBuffer aBufferDest, ImageEncodingParam[] aVideoQuality) {
            Cv2.Resize(myFrame, aDestFrame, aSize);
            ReadOnlyMemory<byte> theFrameBytesLowRes = new ReadOnlyMemory<byte>(aDestFrame.ImEncode(".jpg", aVideoQuality));
            aBufferDest.put(theFrameBytesLowRes, theFrameBytesLowRes.Length);
        }

        public override void publishToBuffer(IntPtr aPtr) {
            while (true)
            {
                if (myVideoCapture.Read(myFrame))
                {
                    processFrame(myResizedFrame, mySize, myCircularByteBuffer, myVideoQuality);
                    if (myLowResCircularByteBuffer != null) processFrame(myLowResResizedFrame, myLowResSize, myLowResCircularByteBuffer, myLowResVideoQuality);
                }
                Thread.Sleep(myFrameRate); // 16 ms is 60fps
            }
        }

        public override CaptureVideo buildLowResStream(params object[] aArgs  /*int aBufferSize, int aFrameWidth, int aFrameHeight*/)
        {
            int theBufferSize=(int)aArgs[0];
            int theFrameWidth=(int)aArgs[1];
            int theFrameHeight=(int)aArgs[2];
            int theFrameQuality = (int)aArgs[3];
            myLowResCircularByteBuffer = new CircularByteBuffer(theFrameWidth * theFrameHeight, theBufferSize);
            myLowResResizedFrame = new Mat();
            myLowResSize = new Size(theFrameWidth, theFrameHeight); 
            myLowResVideoQuality = new ImageEncodingParam[] {
                new ImageEncodingParam(ImwriteFlags.JpegQuality, theFrameQuality),
                new ImageEncodingParam(ImwriteFlags.JpegOptimize, 0), // locked to no optimization, need fast processing
                new ImageEncodingParam(ImwriteFlags.JpegProgressive, 0) // locked to no progressive scan, need fast processing
            };

            return this;
        }

        public CaptureVideo buildInit()
        {
            (new BuilderWarning<CaptureVideo>())
            .requires(myVideoCapture != null, nameof(buildVideoSource))
            .requires(myVideoQuality != null, nameof(buildVideoQuality))
            .requires(myFrameRate != 0, nameof(buildFrameRate))
            .enforce();
            Task.Run(() => { publishToBuffer(IntPtr.Zero); });
            return this;
        }

        public void Dispose()
        {
            myVideoCapture.Dispose();
            myFrame.Dispose();
        }

    }
}
