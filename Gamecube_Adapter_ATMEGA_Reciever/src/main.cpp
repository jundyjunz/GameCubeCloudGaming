#include "ByteReciever.hpp"
#include "Packet.hpp"
#define BAUD_RATE 250000  //https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 164 for baud rate limits, max is 230.4k
#define HANDSHAKE_VALUE 0xFA 
#define START_BYTE 0xFA
#define BYTES_TO_PROCESS 5
#define COMMAND_BYTE_LEN BYTES_TO_PROCESS-2




byte theBytes[BYTES_TO_PROCESS]={};
Packet thePacket(theBytes, BYTES_TO_PROCESS, COMMAND_BYTE_LEN);

void setup() {
  Serial.begin(BAUD_RATE); 
  thePacket.initPacket();
  ByteReciever::confirmHandshake(HANDSHAKE_VALUE);
}

void loop() {
  

  if(!ByteReciever::readBytes(theBytes, BYTES_TO_PROCESS, START_BYTE))return;
  thePacket.unpackPacket(); 
  thePacket.pollPacket();
  thePacket.resetPacket(); 

  
}


