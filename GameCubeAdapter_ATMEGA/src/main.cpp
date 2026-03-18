/*
  ===[DOCUMENTATION]===
  //https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 164 for baud rate limits, max is 230.4k

  https://github.com/SimpleControllers/SimpleControllersBuild-a-Box/blob/master/Simple_Controllers_-_Build-a-Box_-_Version_1.0.ino  
   we cannot bitpack. nicohoods library disables interrupts, which long story short means that the reciever flags get disabled  
   ok fine you want more details? since the reciever flags get disabled, now the arduino cannot properly place bytes in the serial buffer, making it highly prone to corruption 
   since crc8 (with a low margin of error) essentially guarentees our packet be secure, most of our packets dont get through 
  
   https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 154, 19.7.3 
   this approach works because each keystroke causes like 10 serial writes that spam the buffer, so basically one of these commands kinda has to be right
  
   UCSR0A |= (1<<U2X0); // removed, im pretty sure this messes with the security of the writes to the gamecube  
   we can ENABLE the doubling of the clockspeed of USART (UART but with an S (synchronous)) by changing the U2X0 bit  in the UCSR0A register. 
   in other words we do UCR0A |= (1<<U2X0)
   https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 144, 19.3
   https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 276 for a more detailed look at how the bits look. U2X0 is the second bit (bit 1)
*/
#include "PacketRecieve.hpp"


#define CONSOLE_PIN 13 
#define CONTROLLER_PIN 12 

CGamecubeConsole GamecubeConsole(CONSOLE_PIN);   
CGamecubeController GamecubeController1(CONTROLLER_PIN); // this is needed
Gamecube_Data_t thePacket; 
PacketReciever thePacketReciever;


void setup() { 
  //Serial.begin(115200);
  thePacket=defaultGamecubeData;
  thePacketReciever.initPacket();
  GamecubeController1.read();
} 

void loop() {
  // put your main code here, to run repeatedly: 
  thePacketReciever.resetGCPacket(&thePacket);
  thePacketReciever.pollPacket(&thePacket);

  GamecubeConsole.write(thePacket);
  

}