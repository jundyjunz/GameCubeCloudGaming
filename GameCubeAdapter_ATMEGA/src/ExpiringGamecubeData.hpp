/*==[DEPRECATED]==
#include "Nintendo.h" 

class ExpiringGamecubeData{ 
    protected:  
        int myExpirationCount;
        int myExpirationCounter; 
        Gamecube_Data_t myData; 

        void reset(){ 
            myData=defaultGamecubeData;
            myExpirationCounter=0;
        } 

        ExpiringGamecubeData& operator=(ExpiringGamecubeData& aOtherExpiringGamecubeData){ 
            myData=aOtherExpiringGamecubeData.myData; 
            myExpirationCounter=aOtherExpiringGamecubeData.myExpirationCounter; 
            return *this;     
        } 

        ExpiringGamecubeData(ExpiringGamecubeData& aOtherExpiringGamecubeData){ 
            *this=aOtherExpiringGamecubeData;
        }

    public: 
        ExpiringGamecubeData(int aExpirationCount): myExpirationCount(aExpirationCount) {  
            reset();
        }   

        Gamecube_Data_t& getData(){ 
            return myData;
        }

        ExpiringGamecubeData operator++(int){ 
            ExpiringGamecubeData theOldData = *this; 
            myExpirationCounter++; 
            if(myExpirationCounter>myExpirationCount)reset();
            return theOldData;
            
        }
        
}; 
*/