using GameCubeOnline.Helpers;
using PortAudioSharp;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

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

        protected OSPlatform getOS() {
            return RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? OSPlatform.Windows
                : RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? OSPlatform.OSX
                : OSPlatform.Linux;
        } 

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
            OSPlatform thePlatform = getOS(); 

            myName = (thePlatform==OSPlatform.Windows) ? "Digital Audio Interface (USB3 Digital Audio)" 
                     :(thePlatform==OSPlatform.OSX) ? "" // TODO: find out what the equivalent on mac is. 
                     :"alsa_input.usb-UltraSemi_Guermok_USB3_Video_80646466-02.analog-stereo";

            myRealName = "Guermok";
            myDefaultSampleRate = 48000.0;
            myDefaultHighOutputLatency = 0.0;
            myDefaultLowOutputLatency = 0.0;
        }
    }

}
