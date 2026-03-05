#include "ByteReciever.hpp"
#include "Nintendo.h"
#include "StdString.hpp" 
#include "Hashmap.hpp" 
#define SERIAL_RX_BUFFER_SIZE 1024
#define PACKET_CYCLES 6
#define HASHMAP_SIZE 128 
#define CONSOLE_PIN 2  
#define CONTROLLER_PIN 7 
#define INPUT_BUFFER_SIZE 8
#define BAUD_RATE 250000  //https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 164 for baud rate limits, max is 230.4k
#define STICK_POS 191 //255 and 0 seem to be mapped to the same on yaxis. Using 254 and 1 instead.
#define STICK_NEG 65 
#define STICK_DEFAULT 128 
#define HANDSHAKE_VALUE 0xFA
#define IDN "GCN_ADAPTOR"


//Defines a "Gamecube Console" sending data to the console on pin 8
CGamecubeConsole GamecubeConsole(CONSOLE_PIN);   

//This is needed but you don't need a controller on pin 7
CGamecubeController GamecubeController1(CONTROLLER_PIN); 

StdString<INPUT_BUFFER_SIZE> theInputBuffer;

typedef void (*PacketModifier)(Gamecube_Data_t*);

Hashmap<char, PacketModifier, HASHMAP_SIZE> theDispatch;
//https://github.com/SimpleControllers/SimpleControllersBuild-a-Box/blob/master/Simple_Controllers_-_Build-a-Box_-_Version_1.0.ino

// we cannot bitpack. nicohoods library disables interrupts, which long story short means that the reciever flags get disabled  
// ok fine you want more details? since the reciever flags get disabled, now the arduino cannot properly place bytes in the serial buffer, making it highly prone to corruption 
// since crc8 (with a low margin of error) essentially guarentees our packet be secure, most of our packets dont get through 
//https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 154, 19.7.3

// this approach works because each keystroke causes like 10 serial writes that spam the buffer, so basically one of these commands kinda has to be right
void setup() {
    Serial.begin(BAUD_RATE);
    UCSR0A |= (1<<U2X0);
    // we can ENABLE the doubling of the clockspeed of USART (UART but with an S (synchronous)) by changing the U2X0 bit  in the UCSR0A register. 
    // in other words we do UCR0A |= (1<<U2X0)
    //https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 144, 19.3
    //https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf --> see page 276 for a more detailed look at how the bits look. U2X0 is the second bit (bit 1)

    theDispatch.insert('#',[](Gamecube_Data_t* aPacket){Serial.println(IDN);});

     
 
    theDispatch.insert('a',[](Gamecube_Data_t* aPacket){aPacket->report.a=1;                }); 
    theDispatch.insert('b',[](Gamecube_Data_t* aPacket){aPacket->report.b=1;                });
    theDispatch.insert('x',[](Gamecube_Data_t* aPacket){aPacket->report.x=1;                });
    theDispatch.insert('y',[](Gamecube_Data_t* aPacket){aPacket->report.y=1;                });
    
    theDispatch.insert('l',[](Gamecube_Data_t* aPacket){aPacket->report.l=1;                });
    theDispatch.insert('r',[](Gamecube_Data_t* aPacket){aPacket->report.r=1;                });
    theDispatch.insert('z',[](Gamecube_Data_t* aPacket){aPacket->report.z=1;                });
    theDispatch.insert('s',[](Gamecube_Data_t* aPacket){aPacket->report.start=1;            });
    
    theDispatch.insert('U',[](Gamecube_Data_t* aPacket){aPacket->report.yAxis=STICK_POS;    });
    theDispatch.insert('D',[](Gamecube_Data_t* aPacket){aPacket->report.yAxis=STICK_NEG;    });
    theDispatch.insert('L',[](Gamecube_Data_t* aPacket){aPacket->report.xAxis=STICK_NEG;    });
    theDispatch.insert('R',[](Gamecube_Data_t* aPacket){aPacket->report.xAxis=STICK_POS;    });

    theDispatch.insert('1',[](Gamecube_Data_t* aPacket){aPacket->report.dup=1;              });
    theDispatch.insert('2',[](Gamecube_Data_t* aPacket){aPacket->report.dleft=1;            });
    theDispatch.insert('3',[](Gamecube_Data_t* aPacket){aPacket->report.ddown=1;            });
    theDispatch.insert('4',[](Gamecube_Data_t* aPacket){aPacket->report.dright=1;           });   

    theDispatch.insert('5',[](Gamecube_Data_t* aPacket){aPacket->report.cyAxis=STICK_POS;   });
    theDispatch.insert('6',[](Gamecube_Data_t* aPacket){aPacket->report.cyAxis=STICK_NEG;   });
    theDispatch.insert('7',[](Gamecube_Data_t* aPacket){aPacket->report.cxAxis=STICK_NEG;   });
    theDispatch.insert('8',[](Gamecube_Data_t* aPacket){aPacket->report.cxAxis=STICK_POS;   });

  GamecubeController1.read();
} 

void loop() {
  // put your main code here, to run repeatedly: 
    Gamecube_Data_t thePacket=defaultGamecubeData; 
    while(Serial.available()){ 
        theInputBuffer+=Serial.read();
        if(theInputBuffer.length()==INPUT_BUFFER_SIZE || theInputBuffer[-1]=='\n') break;
    }  
    for(int i=0; i<theInputBuffer.length(); i++){ 
        if(theDispatch.contains(theInputBuffer[i]))theDispatch.at(theInputBuffer[i])(&thePacket);
    }     
    theInputBuffer.clear(); 
    //We need to send packets for more than one cycle because loop() is faster than the gamecube can handle inputs
    for(int i=0; i<PACKET_CYCLES; i++)GamecubeConsole.write(thePacket);    
}