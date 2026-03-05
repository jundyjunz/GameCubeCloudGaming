#pragma once
#include <Arduino.h> 

class ByteReciever{  
    
    public: 
        static byte myPolynomialMultiplier;

        static void confirmHandshake(byte aByte){ 
            while(!Serial.available());
            if(aByte==Serial.read()) Serial.write(aByte); 
        }

        static bool scanForFirstByte(byte* aByte, byte aStartByte) {
            while (Serial.available()) {
                byte thePotentialFirstByte = Serial.read();
                if (thePotentialFirstByte == aStartByte) {
                    *aByte = thePotentialFirstByte;
                    return true;
                }
            }
            return false;
        }
     
        static bool readBytes(byte* theByteArrRef, int theBytesToRead , byte aStartByte) {

            if (!scanForFirstByte(&theByteArrRef[0], aStartByte)) return false;

            int i = 1;
            unsigned long theTimeoutStartTime = millis();

            while (i < theBytesToRead) {
                if (Serial.available()) theByteArrRef[i++] = Serial.read();
                if (millis() - theTimeoutStartTime > 50) return false;  // timeout
            }

            return crc8(theByteArrRef, theBytesToRead - 1) == theByteArrRef[theBytesToRead - 1];
        } 

        static void readBytesUnitTest(byte* theByteArrayRef, int theByteArrLen, byte theStartByte){ 
            byte theFirstByte =theByteArrayRef[0]; 
            if(theFirstByte !=theStartByte){  
                Serial.println("Start Byte Check Failed.");
                return; 
            }  
            Serial.println("Start byte good.");
            if(crc8(theByteArrayRef, theByteArrLen-1)==theByteArrayRef[theByteArrLen-1]){ 
                Serial.println("CRC8 Check Good.");    
                return;  
            }
            Serial.println("CRC8 Check Failed.");
        }

       
        static byte crc8(byte* theByteArrayRef, int theByteArrayLen){ 
            byte theEvolvingCRC =0x00;
            for(int i=0; i<theByteArrayLen; i++){ 
                byte theCurrentByte=theByteArrayRef[i]; 
                for(int j=0; j<8; j++){ 
                    int theAreBothBitsDifferent=(theEvolvingCRC^theCurrentByte)&0x01; 
                    theEvolvingCRC>>=1; 
                    if(theAreBothBitsDifferent)theEvolvingCRC^=myPolynomialMultiplier; 
                    theCurrentByte>>=1;
                }
            }
            return theEvolvingCRC;
        }

      

}; 

byte ByteReciever::myPolynomialMultiplier=0xFA;