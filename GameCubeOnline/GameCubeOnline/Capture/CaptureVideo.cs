using GameCubeOnline.Helpers;
using OpenCvSharp;

namespace GameCubeOnline.Capture
{
    class CaptureVideo : Capture<CaptureVideo>, Builder<CaptureVideo>, IDisposable
    {
        protected VideoCapture myVideoCapture;
        protected Size mySize;
        protected Mat myFrame;
        protected Mat myResizedFrame;
        protected ImageEncodingParam[] myVideoQuality;

        public CaptureVideo(int aBufferSize, int aFrameWidth, int aFrameHeight) : base(aFrameWidth * aFrameHeight * 3 , aBufferSize) // x3 for each rgb channel
        {
            myVideoQuality = null;
            myVideoCapture = null;
            mySize = new Size(aFrameWidth, aFrameHeight);
            myFrame = new Mat();
            myResizedFrame = new Mat();
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


        protected void processFrame()
        {
            Cv2.Resize(myFrame, myResizedFrame, mySize);
            ReadOnlyMemory<byte> theFrameBytes = new ReadOnlyMemory<byte>(myResizedFrame.ImEncode(".jpg", myVideoQuality));
            myCircularByteBuffer.put(theFrameBytes, theFrameBytes.Length);
            Thread.Sleep(myFrameRate); // 16 ms is 60fps
        }

        public override void publishToBuffer(IntPtr aPtr) { while (true) if (myVideoCapture.Read(myFrame)) processFrame(); }


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
