
using GameCubeOnline.Capture;
using GameCubeOnline.Helpers;
using Microsoft.Extensions.FileProviders;
using System.Runtime;
using System.Text.Json;

namespace GameCubeOnline
{
    
    
    class GameCubeOnlineSettingsSerialized
    {   
        public int[][]? PageLockMatrix { get; set; }

        public Dictionary<string, JsonElement>? VideoSettings { get; set; }
        public Dictionary<string, JsonElement>? AudioSettings { get; set; }
        public Dictionary<string, JsonElement>? SerialSettings { get; set; }
    }
    class GameCubeOnlineSettings : Builder<GameCubeOnlineSettings>
    {
        protected PhysicalFileProvider myStaticFiles;
        public PhysicalFileProvider StaticFiles { get => myStaticFiles; }

        protected GameCubeOnlineSettingsSerialized mySerializedSettings;


        public List<string> Hashes; 

        public int VideoBufferSize  { get => mySerializedSettings.VideoSettings!["BufferSize"].Deserialize<int>(); }
        public int FrameWidth       { get => mySerializedSettings.VideoSettings!["FrameWidth"].Deserialize<int>(); }
        public int FrameHeight      { get => mySerializedSettings.VideoSettings!["FrameHeight"].Deserialize<int>(); }
        public int VideoQuality     { get => mySerializedSettings.VideoSettings!["VideoQuality"].Deserialize<int>(); }
        public int VideoSource      { get => mySerializedSettings.VideoSettings!["VideoSource"].Deserialize<int>(); } 
        public int ServerVideoFrameRate   { get => mySerializedSettings.VideoSettings!["ServerFrameRate"].Deserialize<int>(); }
        public int ClientVideoFrameRate { get => mySerializedSettings.VideoSettings!["ClientFrameRate"].Deserialize<int>(); }
        public bool UseHuffmanOptimization { get => mySerializedSettings.VideoSettings!["UseHuffmanOptimization"].Deserialize<bool>(); }
        public bool UseProgressiveScan { get => mySerializedSettings.VideoSettings!["UseProgressiveScan"].Deserialize<bool>(); }
        public int LowResVideoBufferSize { get=> mySerializedSettings.VideoSettings!["LowResBufferSize"].Deserialize<int>(); } 
        public int LowResFrameWidth { get=> mySerializedSettings.VideoSettings!["LowResFrameWidth"].Deserialize<int>(); } 
        public int LowResFrameHeight { get=> mySerializedSettings.VideoSettings!["LowResFrameHeight"].Deserialize<int>(); }
        public int LowResVideoQuality { get => mySerializedSettings.VideoSettings!["LowResVideoQuality"].Deserialize<int>(); }



        public int AudioBufferSize  { get => mySerializedSettings.AudioSettings!["BufferSize"].Deserialize<int>(); }
        public uint FramesPerBuffer { get => mySerializedSettings.AudioSettings!["FramesPerBuffer"].Deserialize<uint>();  }
        public int ChannelCount     { get => mySerializedSettings.AudioSettings!["ChannelCount"].Deserialize<int>(); }
        public int SampleByteSize   { get => mySerializedSettings.AudioSettings!["SampleByteSize"].Deserialize<int>(); }
        public int ServerAudioFrameRate   { get => mySerializedSettings.AudioSettings!["ServerFrameRate"].Deserialize<int>(); }
        public int ClientAudioFrameRate { get => mySerializedSettings.AudioSettings!["ClientFrameRate"].Deserialize<int>(); }
        public CaptureAudioRuleSet AudioRuleSet  { get => Factory<CaptureAudioRuleSet>.make(mySerializedSettings.AudioSettings!["AudioRuleset"].Deserialize<string>()!); }
        public int LowResAudioBufferSize { get => mySerializedSettings.AudioSettings!["LowResBufferSize"].Deserialize<int>(); }
        public int LowResChannelCount { get => mySerializedSettings.AudioSettings!["LowResChannelCount"].Deserialize<int>(); }



        public int BaudRate         { get => mySerializedSettings.SerialSettings!["BaudRate"].Deserialize<int>(); }
        public int ReadTimeout      { get => mySerializedSettings.SerialSettings!["ReadTimeout"].Deserialize<int>(); }
        public int WriteTimeout     { get => mySerializedSettings.SerialSettings!["WriteTimeout"].Deserialize<int>(); }
        public byte ConnectCode     { get => mySerializedSettings.SerialSettings!["ConnectCode"].Deserialize<byte>(); }
        public int CommandByteLen   { get => mySerializedSettings.SerialSettings!["CommandByteLen"].Deserialize<int>(); }
        public int CommandSendSleepTime { get => mySerializedSettings.SerialSettings!["CommandSendSleepTime"].Deserialize<int>(); }
        public int ReadBytesFromClientTimeout { get => mySerializedSettings.SerialSettings!["ReadBytesFromClientTimeout"].Deserialize<int>(); }

        public GameCubeOnlineSettings() {
            GCSettings.LatencyMode = GCLatencyMode.LowLatency;
            mySerializedSettings = null;
            myStaticFiles=null;
            Hashes = new List<string>();
        }

        public string getFileAt(string aSubPath) => StaticFiles.GetFileInfo(aSubPath).PhysicalPath!;

        public GameCubeOnlineSettings buildStaticFiles(WebApplicationBuilder aBuilder, string aFileDirectory) {
            myStaticFiles = new PhysicalFileProvider(Path.Combine(aBuilder.Environment.ContentRootPath, aFileDirectory));
            return this;
        }

        public GameCubeOnlineSettings buildSettings(string aSubPath) {    
           mySerializedSettings=JsonSerializer.Deserialize<GameCubeOnlineSettingsSerialized>(File.ReadAllText(getFileAt(aSubPath)))!;
           return this;
        }

        public bool isMatrixEquivalent(int[][] aMatrix) {
            // zip takes two sequences and pairs them together.
            // you then provide it to create a value in a sequence per each zipped value. 
            // we then do .All to see if they are all true.
            return (mySerializedSettings.PageLockMatrix!.Length == aMatrix.Length) && mySerializedSettings.PageLockMatrix!.Zip(aMatrix, (myMatrixRow, aMatrixRow) => myMatrixRow.SequenceEqual(aMatrixRow)).All(aIsEqual=>aIsEqual);
        }

        public GameCubeOnlineSettings buildInit() {
            (new BuilderWarning<GameCubeOnlineSettings>())
            .requires(myStaticFiles != null, nameof(buildStaticFiles)) 
            .requires(mySerializedSettings!=null, nameof(buildSettings), "please call buildStaticFiles() before calling this function.")
            .enforce(); 
            return this;
        }
    }
}
