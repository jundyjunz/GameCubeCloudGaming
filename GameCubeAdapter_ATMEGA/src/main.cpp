
#include <Arduino.h> 
#include "Nintendo.h"
#include "StdString.hpp" 
#include "Hashmap.hpp"
#define PACKET_CYCLES 8
#define HASHMAP_SIZE 128 
#define CONSOLE_PIN 2  
#define CONTROLLER_PIN 7 
#define INPUT_BUFFER_SIZE 8
#define BAUD_RATE 9600  
#define STICK_POS 191 //255 and 0 seem to be mapped to the same on yaxis. Using 254 and 1 instead.
#define STICK_NEG 65 
#define STICK_DEFAULT 128

#define IDN "GCN_ADAPTOR"
//Defines a "Gamecube Console" sending data to the console on pin 8
CGamecubeConsole GamecubeConsole(CONSOLE_PIN);   

//This is needed but you don't need a controller on pin 7
CGamecubeController GamecubeController1(CONTROLLER_PIN); 

StdString<INPUT_BUFFER_SIZE> theInputBuffer;

typedef void (*PacketModifier)(Gamecube_Data_t*);

Hashmap<char, PacketModifier, HASHMAP_SIZE> theDispatch;

void setup() {
    Serial.begin(BAUD_RATE);
    theDispatch.insert('#',[](Gamecube_Data_t* aPacket){Serial.println(IDN);});

     
 
    theDispatch.insert('a',[](Gamecube_Data_t* aPacket){aPacket->report.a=1; }); 
    theDispatch.insert('b',[](Gamecube_Data_t* aPacket){aPacket->report.b=1; });
    theDispatch.insert('x',[](Gamecube_Data_t* aPacket){aPacket->report.x=1; });
    theDispatch.insert('y',[](Gamecube_Data_t* aPacket){aPacket->report.y=1; });
    
    theDispatch.insert('l',[](Gamecube_Data_t* aPacket){aPacket->report.left=1; });
    theDispatch.insert('r',[](Gamecube_Data_t* aPacket){aPacket->report.right=1; });
    theDispatch.insert('z',[](Gamecube_Data_t* aPacket){aPacket->report.z=1; });
    theDispatch.insert('s',[](Gamecube_Data_t* aPacket){aPacket->report.start=1; });
    
    theDispatch.insert('U',[](Gamecube_Data_t* aPacket){aPacket->report.yAxis=STICK_POS;  });
    theDispatch.insert('D',[](Gamecube_Data_t* aPacket){aPacket->report.yAxis=STICK_NEG;  });
    theDispatch.insert('L',[](Gamecube_Data_t* aPacket){aPacket->report.xAxis=STICK_NEG;  });
    theDispatch.insert('R',[](Gamecube_Data_t* aPacket){aPacket->report.xAxis=STICK_POS; });

    theDispatch.insert('1',[](Gamecube_Data_t* aPacket){aPacket->report.dup=1;  });
    theDispatch.insert('2',[](Gamecube_Data_t* aPacket){aPacket->report.dleft=1;  });
    theDispatch.insert('3',[](Gamecube_Data_t* aPacket){aPacket->report.ddown=1;  });
    theDispatch.insert('4',[](Gamecube_Data_t* aPacket){aPacket->report.dright=1; });   

    theDispatch.insert('5',[](Gamecube_Data_t* aPacket){aPacket->report.cyAxis=STICK_POS; });
    theDispatch.insert('6',[](Gamecube_Data_t* aPacket){aPacket->report.cyAxis=STICK_NEG; });
    theDispatch.insert('7',[](Gamecube_Data_t* aPacket){aPacket->report.cxAxis=STICK_NEG; });
    theDispatch.insert('8',[](Gamecube_Data_t* aPacket){aPacket->report.cxAxis=STICK_POS; });

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


/*==[test]== 
#include <stdlib.h> // Required for exit()
#include <iostream>
template < typename Key, typename Value, int SIZE>
class Hashmap{ 
    //https://benhoyt.com/writings/hash-table-in-c/ <--linear probing hashmap to prevent collisions
    private: 
        
        struct KeyValuePair{ 
            Key myKey; 
            Value myValue; 
            bool myIsOccupied; 
            
            KeyValuePair(){ myIsOccupied=false;}  

            KeyValuePair(const Key& aKey, const Value& aValue, const bool aIsOccupied): 
                myKey(aKey), myValue(aValue), myIsOccupied(aIsOccupied){ }
             
        }; 
        
        KeyValuePair myValues[SIZE]; 
        int myTotalEntries;

            
        int hash(const Key& aKey){ 
            return (static_cast<int>(aKey)*31)%SIZE;

        } 
        

        int findHash(const Key& aKey, int aCase){ 
            int theHash=hash(aKey); 
            for(int i=0; i<SIZE; i++){  
                switch(aCase){ 
                    case 0: if(!myValues[theHash].myIsOccupied) return theHash; break;
                    case 1: if(myValues[theHash].myKey==aKey) return theHash; break;
                    default:
                        printf("Invalid Case for FindHash Entered.");
                        exit(EXIT_FAILURE);
                }
                
                theHash=(theHash+1)%SIZE;
            } 
            return -1;
        }

    public:

        Hashmap(){ 
            myTotalEntries=0;
        } 
        
        Hashmap& operator=(const Hashmap& aOtherMap){ 
            for(int i=0; i< SIZE; i++) myValues[i]=aOtherMap.myValues[i];
            myTotalEntries=aOtherMap.myTotalEntries;
            return *this;
        } 

        Hashmap(const Hashmap& aOtherMap){ 
            *this=aOtherMap;
        } 
       
        bool contains(const Key& aKey){ 
            return findHash(aKey, 1)>=0;
        }

        void insert(const Key& aKey, const Value& aValue){  
            if(myTotalEntries==SIZE)return;
            int thePotentialHash=findHash(aKey, 0);  
            myValues[thePotentialHash]=KeyValuePair(aKey, aValue, true);
            myTotalEntries++;
        } 

        void remove(const Key& aKey){ 
            int thePotentialHash=findHash(aKey, 1); 
            if(thePotentialHash<0) return;
            myValues[thePotentialHash].myIsOccupied=false; 
            myTotalEntries--;
        }

        Value at(const Key& aKey){  
            int thePotentialHash=findHash(aKey,1); 
            if(thePotentialHash<0){ 
                printf("Invalid Key Entered.");
                exit(EXIT_FAILURE);
            }
            return myValues[thePotentialHash].myValue;
        }

};

template<int SIZE>
class StdString{ 
    private:
    
        char myString[SIZE]; 

    
    public: 
        int length() const{ 
            int theLen=0; 
            while(myString[theLen]!='\0')theLen++;
            return theLen;
        }
        StdString(){ 
             myString[0] = '\0';
        }
        StdString(const char* aCString){  
            int i;
            for(i=0; i<SIZE-1; i++){ 
                if(aCString[i]=='\0')break;
                myString[i]=aCString[i];
            }  
            myString[i]='\0';
        } 
        
        StdString& operator=(const StdString& aOtherString){
            int i=0;
            for(i=0; i<aOtherString.length(); i++) myString[i] = aOtherString.myString[i];  
            myString[i]='\0';
            return *this;
        } 

        StdString& operator=(const char* aCString){ 
            *this=StdString(aCString);
            return *this;
        }

        StdString(const StdString& aOtherString){ 
            *this=aOtherString;    
        }   

        bool operator==(const StdString& aOtherString) const{ 
            if(aOtherString.length()!=length()) return false; 
            for(int i=0; i<length(); i++) if(myString[i]!=aOtherString.myString[i]) return false; 
            return true;
        }  

        operator int() const{ 
            int theHash=0;  
            int theFactor=31; 
            char theCurrentChar=myString[0];  
            int theIndex=0;
            while(theCurrentChar!='\0'){ 
                theHash = theFactor*theHash+myString[theIndex]; 
                theCurrentChar=myString[++theIndex];
            }   

            return theHash;
        } 

        StdString& operator+=(char aChar){
            int theOldLength=length();
            if(theOldLength+1>=SIZE) return *this; 
            myString[theOldLength]=aChar; 
            myString[theOldLength+1]='\0';
            return *this;
        }



};

typedef void (*FuncPtr)();

int main()
{
    Hashmap<StdString<2>, FuncPtr, 32> theDispatch; 
    theDispatch.insert("w",[](){std::cout<<"UP"<<'\n';});
    theDispatch.insert("a",[](){std::cout<<"LEFT"<<'\n';});
    theDispatch.insert("s",[](){std::cout<<"DOWN"<<'\n';});
    theDispatch.insert("d",[](){std::cout<<"RIGHT"<<'\n';});
    while(true){  
        StdString<2> theStrInput;
        char theInput;
        while ((theInput = std::cin.get()) != '\n') {
            theStrInput += theInput;
        }
        
        if(theDispatch.contains(theStrInput)) theDispatch.at(theStrInput)(); 

    }
    return 0;
}
*/
