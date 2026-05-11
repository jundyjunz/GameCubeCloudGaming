using PortAudioSharp;
using GameCubeOnline.Helpers;
using System.Runtime.CompilerServices;

namespace GameCubeOnline.Capture
{ 

    abstract class CaptureAudioRuleSet
    {
        protected string myName;
        protected string myRealName;
        protected double myDefaultSampleRate;
        protected double myDefaultHighOutputLatency;
        protected double myDefaultLowOutputLatency;
        public string RealName { get => myRealName; }

        public bool check(DeviceInfo aDeviceInfo)
        {
            return aDeviceInfo.name == myName &&
                    aDeviceInfo.defaultSampleRate == myDefaultSampleRate &&
                    aDeviceInfo.defaultHighOutputLatency == myDefaultHighOutputLatency &&
                    aDeviceInfo.defaultLowOutputLatency == myDefaultLowOutputLatency;
        }
    }

    class GuermokRuleSet : CaptureAudioRuleSet, Factory<CaptureAudioRuleSet>.Registry<GuermokRuleSet>
    {
        [ModuleInitializer] public static void forceRegistry() { Factory<CaptureAudioRuleSet>.Registry<GuermokRuleSet>.register(aObjects => new GuermokRuleSet()); }
        public GuermokRuleSet()
        {
            myName = "Digital Audio Interface (USB3 Digital Audio)";
            myRealName = "Guermok";
            myDefaultSampleRate = 48000.0;
            myDefaultHighOutputLatency = 0.0;
            myDefaultLowOutputLatency = 0.0;
        }
    }

}
