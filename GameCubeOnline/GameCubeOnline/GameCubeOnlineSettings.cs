
using GameCubeOnline.Helpers;
using Microsoft.Extensions.FileProviders;
using System.Runtime;

namespace GameCubeOnline
{
    class GameCubeOnlineSettings : Builder<GameCubeOnlineSettings>
    {

        protected int myBufferSize; 
        public int BufferSize { get => myBufferSize; }
        protected PhysicalFileProvider myStaticFiles;
        public PhysicalFileProvider StaticFiles { get => myStaticFiles; }
        protected int myFrameRate; 
        public int FrameRate { get => myFrameRate; }

        public GameCubeOnlineSettings() {
            GCSettings.LatencyMode = GCLatencyMode.LowLatency;
            myBufferSize = 0; 
            myStaticFiles=null;
        }


        public string getFileAt(string aSubPath) => StaticFiles.GetFileInfo(aSubPath).PhysicalPath!;
       

        public GameCubeOnlineSettings buildBufferSize(int aBufferSize) {  
            myBufferSize=aBufferSize; 
            return this;
        } 

        public GameCubeOnlineSettings buildStaticFiles(WebApplicationBuilder aBuilder, string aFileDirectory) {
            myStaticFiles = new PhysicalFileProvider(Path.Combine(aBuilder.Environment.ContentRootPath, "static"));
            return this;
        }

        public GameCubeOnlineSettings buildFrameRate(int aFrameRateInMs) {
            myFrameRate = aFrameRateInMs;
            return this;
        }

        public GameCubeOnlineSettings buildInit() {
            (new BuilderWarning<GameCubeOnlineSettings>())
            .requires(myBufferSize != 0, nameof(buildBufferSize))
            .requires(myStaticFiles != null, nameof(buildStaticFiles))
            .enforce(); 
            return this;
        }
    }
}
