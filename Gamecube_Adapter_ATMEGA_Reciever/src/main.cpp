#include "ByteReciever.hpp"
#include "Packet.hpp"
#define BAUD_RATE 250000  //https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 164 for baud rate limits, max is 230.4k
#define HANDSHAKE_VALUE 0xFA 
#define START_BYTE 0xFA
#define BYTES_TO_PROCESS 5




byte theBytes[BYTES_TO_PROCESS];
Packet thePacket;

void setup() {
  Serial.begin(BAUD_RATE); 
  thePacket.initPacket();
  ByteReciever::confirmHandshake(HANDSHAKE_VALUE);
}

void loop() {
  // put your main code here, to run repeatedly:  
  if(!ByteReciever::readBytes(theBytes, BYTES_TO_PROCESS, START_BYTE)) return;   
  thePacket.unpackPacket(theBytes); 
  thePacket.pollPacket();
  thePacket.resetPacket(); 

  
}


