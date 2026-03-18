#pragma once
#include <Arduino.h> 

class ByteReciever{  
    
    public: 
        static byte myPolynomialMultiplier;

        static void confirmHandshake(byte aByte){ 
            while(!Serial.available()); 
            byte thePotentialHandhsakeByte=Serial.read();
            if(thePotentialHandhsakeByte==aByte) Serial.write(aByte);   
        }

        
     
        static bool readBytes(byte* theByteArrRef, int theBytesToRead , byte aStartByte) { 
            while (Serial.available()) {
                if(Serial.peek()!=aStartByte){Serial.read(); continue;} // toss out bits until we get the correct one.
                if (Serial.available() < theBytesToRead) return false; // here to prevent reading empty bytes. empty bytes are interpreted as -1 or FF. Can accidentally match with crc8. 
                for(int i=0; i< theBytesToRead; i++)theByteArrRef[i] = Serial.read(); // read bytes comming from stream
                return crc8(theByteArrRef, theBytesToRead - 1) == theByteArrRef[theBytesToRead - 1]; // checkcrc8
            }
            return false;
 
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