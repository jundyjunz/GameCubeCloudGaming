#pragma once 

#include <Arduino.h> 
#include <stdlib.h> // Required for exit()

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