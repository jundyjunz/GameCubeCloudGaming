#include "PacketRecieveMacros.hpp"
#include "Nintendo.h"

#define STICK_POS 191 //255 and 0 seem to be mapped to the same on yaxis. Using 254 and 1 instead.
#define STICK_NEG 65 
#define STICK_DEFAULT 128 

class PacketReciever{ 
    private: 
        bool readFromPacket(int aInputPin){ return digitalRead(aInputPin)==HIGH; }
    public:
        PacketReciever(){} 

        void initPacket(){ 
            pinMode(PIN_A,            INPUT); 
            pinMode(PIN_B,            INPUT); 
            pinMode(PIN_X,            INPUT); 
            pinMode(PIN_Y,            INPUT); 
            pinMode(PIN_DUP,          INPUT); 
            pinMode(PIN_DDOWN,        INPUT); 
            pinMode(PIN_DLEFT,        INPUT); 
            pinMode(PIN_DRIGHT,       INPUT); 
            pinMode(PIN_START,        INPUT); 
            pinMode(PIN_LTRIGGER,     INPUT); 
            pinMode(PIN_RTRIGGER,     INPUT); 
            //pinMode(PIN_CUP,        INPUT); 
            //pinMode(PIN_CDOWN,      INPUT); 
            //pinMode(PIN_CLEFT,      INPUT); 
            //pinMode(PIN_CRIGHT,     INPUT); 
            pinMode(PIN_UP,           INPUT); 
            pinMode(PIN_DOWN,         INPUT); 
            pinMode(PIN_LEFT,         INPUT); 
            pinMode(PIN_RIGHT,        INPUT); 
            pinMode(PIN_ZTRIGGER,     INPUT); 
        }

        void A          (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_A       )) aPacket->report.a=1               ;}
        void B          (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_B       )) aPacket->report.b=1               ;}
        void X          (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_X       )) aPacket->report.x=1               ;}
        void Y          (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_Y       )) aPacket->report.y=1               ;}
        void Dup        (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_DUP     )) aPacket->report.dup=1             ;}
        void Ddown      (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_DDOWN   )) aPacket->report.ddown=1           ;}
        void Dleft      (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_DLEFT   )) aPacket->report.dleft=1           ;}
        void Dright     (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_DRIGHT  )) aPacket->report.dright=1          ;}
        void Start      (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_START   ))  aPacket->report.start=1           ;}
        void Ltrigger   (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_LTRIGGER)) aPacket->report.l=1               ;}
        void Rtrigger   (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_RTRIGGER)) aPacket->report.r=1               ;}
        //void Cup        (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_CUP     )) aPacket->report.cyAxis=STICK_POS  ;}
        //void Cdown      (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_CDOWN   )) aPacket->report.cyAxis=STICK_NEG  ;}
        //void Cleft      (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_CLEFT   )) aPacket->report.cxAxis=STICK_NEG  ;}
        //void Cright     (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_CRIGHT  )) aPacket->report.cxAxis=STICK_POS  ;}
        void Up         (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_UP      )) aPacket->report.yAxis=STICK_POS   ;}
        void Down       (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_DOWN    )) aPacket->report.yAxis=STICK_NEG   ;}
        void Left       (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_LEFT    )) aPacket->report.xAxis=STICK_NEG   ;}
        void Right      (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_RIGHT   )) aPacket->report.xAxis=STICK_POS   ;}
        void Ztrigger   (Gamecube_Data_t* aPacket){ if(readFromPacket(PIN_ZTRIGGER))  aPacket->report.z=1               ;} 

        void pollPacket(Gamecube_Data_t* aPacket){ 
            A          (aPacket);
            B          (aPacket);
            X          (aPacket);
            Y          (aPacket);
            Dup        (aPacket);
            Ddown      (aPacket);
            Dleft      (aPacket);
            Dright     (aPacket);
            Start      (aPacket);
            Ltrigger   (aPacket);
            Rtrigger   (aPacket);
            //Cup        (aPacket);
            //Cdown      (aPacket);
            //Cleft      (aPacket);
            //Cright     (aPacket);
            Up         (aPacket);
            Down       (aPacket);
            Left       (aPacket);
            Right      (aPacket);
            Ztrigger   (aPacket);
        } 

        void resetGCPacket(Gamecube_Data_t* aPacket){ 
            aPacket->report.a=0                     ;              
            aPacket->report.b=0                     ;              
            aPacket->report.x=0                     ;             
            aPacket->report.y=0                     ;             
            aPacket->report.dup=0                   ;          
            aPacket->report.ddown=0                 ;     
            aPacket->report.dleft=0                 ;    
            aPacket->report.dright=0                ;   
            aPacket->report.start=0                 ;  
            aPacket->report.l=0                     ; 
            aPacket->report.r=0                     ;
            aPacket->report.cyAxis=STICK_DEFAULT    ;
            aPacket->report.cxAxis=STICK_DEFAULT    ;
            aPacket->report.yAxis=STICK_DEFAULT     ;
            aPacket->report.xAxis=STICK_DEFAULT     ;
            aPacket->report.z=0                     ;
        }

};