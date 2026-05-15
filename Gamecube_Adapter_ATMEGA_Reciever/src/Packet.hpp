#pragma once
#include <Arduino.h> 
#include "PacketMacros.hpp" 
#define BYTE_LEN 8 
#define TOTAL_BITS 24


class Packet{  
    private:   
        byte* myBufferArray;  
        int myBufferArrayLen; 
        int myCommandBytesLen;
        bool myPacket[TOTAL_BITS];  
        void digitalWriteFromPacket(int aPacketIndex, int aOutputPin){  
            if( myPacket[aPacketIndex]) digitalWrite(aOutputPin, HIGH);  
            else                        digitalWrite(aOutputPin, LOW);
        } 
        
      
    public:
        Packet(byte* aBufferArray, int aBufferArrayLen, int aCommandBytesLen) { 
            myBufferArray=aBufferArray;   
            myBufferArrayLen=aBufferArrayLen; 
            myCommandBytesLen=aCommandBytesLen;
            resetPacket();  
        } 

        void initPacket(){ 
            pinMode(PIN_A, OUTPUT); 
            pinMode(PIN_B, OUTPUT); 
            pinMode(PIN_X, OUTPUT); 
            pinMode(PIN_Y, OUTPUT); 
            pinMode(PIN_DUP, OUTPUT); 
            pinMode(PIN_DDOWN, OUTPUT); 
            pinMode(PIN_DLEFT, OUTPUT); 
            pinMode(PIN_DRIGHT, OUTPUT); 
            pinMode(PIN_START, OUTPUT); 
            pinMode(PIN_LTRIGGER, OUTPUT); 
            pinMode(PIN_RTRIGGER, OUTPUT); 
            pinMode(PIN_UP, OUTPUT); 
            pinMode(PIN_DOWN, OUTPUT); 
            pinMode(PIN_LEFT, OUTPUT); 
            pinMode(PIN_RIGHT, OUTPUT); 
            pinMode(PIN_ZTRIGGER, OUTPUT);  
        }

        void unpackPacket(){  
            byte theCommandBytes[myCommandBytesLen]; 
            for(int i=0; i<myCommandBytesLen; i++ ) theCommandBytes[i]=myBufferArray[i+1];
            for(int i=0; i< myCommandBytesLen; i++) for(int k=0; k<BYTE_LEN; k++) myPacket[i*BYTE_LEN+k] = ((theCommandBytes[i]>>(7-k)) & 0x01) == 0x01;
        }  

        void resetPacket(){  for(int i=0; i< TOTAL_BITS; i++) myPacket[i]=false; }

        void A            (){digitalWriteFromPacket(0 ,     PIN_A              );}
        void B            (){digitalWriteFromPacket(1 ,     PIN_B              );}      
        void X            (){digitalWriteFromPacket(2 ,     PIN_X              );}     
        void Y            (){digitalWriteFromPacket(3 ,     PIN_Y              );}      
        void Dup          (){digitalWriteFromPacket(4 ,     PIN_DUP            );}  
        void Ddown        (){digitalWriteFromPacket(5 ,     PIN_DDOWN          );} 
        void Dleft        (){digitalWriteFromPacket(6 ,     PIN_DLEFT          );}
        void Dright       (){digitalWriteFromPacket(7 ,     PIN_DRIGHT         );}
        void Start        (){digitalWriteFromPacket(8 ,     PIN_START          );}
        void Ltrigger     (){digitalWriteFromPacket(9 ,     PIN_LTRIGGER       );}
        void Rtrigger     (){digitalWriteFromPacket(10,     PIN_RTRIGGER       );}
        void Up           (){digitalWriteFromPacket(15,     PIN_UP             );} 
        void Down         (){digitalWriteFromPacket(16,     PIN_DOWN           );} 
        void Left         (){digitalWriteFromPacket(17,     PIN_LEFT           );} 
        void Right        (){digitalWriteFromPacket(18,     PIN_RIGHT          );}
        void Ztrigger     (){digitalWriteFromPacket(19,     PIN_ZTRIGGER       );} 

        void pollPacket(){ 
            A            ();
            B            ();
            X            ();
            Y            ();
            Dup          ();
            Ddown        ();
            Dleft        ();
            Dright       ();
            Start        ();
            Ltrigger     ();
            Rtrigger     ();
            Up           ();
            Down         ();
            Left         ();
            Right        ();
            Ztrigger     ();
        }
};