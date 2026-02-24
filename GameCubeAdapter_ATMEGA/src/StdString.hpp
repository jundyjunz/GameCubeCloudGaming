#include <stdlib.h> // Required for exit()

template<int SIZE>
class StdString{ 
    protected:
    
        char myString[SIZE]; 

    
    public: 

        int cStringLength(const char* aCstring){
            int theLen=0; 
            char theCurChar=aCstring[theLen]; 
            while(theCurChar!='\0') theCurChar=aCstring[++theLen];
            return theLen;
        }
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
            if(cStringLength(aCString)+1>SIZE){ 
                printf("cString Too Long!");
                exit(EXIT_FAILURE);
            }
            for(i=0; i<SIZE-1; i++){ 
                if(aCString[i]=='\0')break;
                myString[i]=aCString[i];
            }  
            myString[i]='\0';
        } 
        
        StdString<SIZE>& operator=(const StdString<SIZE>& aOtherString){
            int i=0;
            for(i=0; i<aOtherString.length(); i++) myString[i] = aOtherString.myString[i];  
            myString[i]='\0';
            return *this;
        } 

        StdString<SIZE>& operator=(const char* aCString){ 
            *this=StdString(aCString);
            return *this;
        }

        StdString(const StdString<SIZE>& aOtherString){ 
            *this=aOtherString;    
        }   

        bool operator==(const StdString<SIZE>& aOtherString) const{ 
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

        StdString<SIZE>& operator+=(char aChar){
            int theOldLength=length();
            if(theOldLength+1>=SIZE) return *this; 
            myString[theOldLength]=aChar; 
            myString[theOldLength+1]='\0';
            return *this;
        }  

        char& operator[](int aPos){   
            if(aPos<0) aPos = length()+aPos; 
            if(aPos<0 || aPos>= length()) { 
                printf("String Out Of Bounds Indexing Detected.");
                exit(EXIT_FAILURE);
            }
            return myString[aPos];
        }

        void clear(){ 
            myString[0]='\0';
        }


}; 

/*==[DEPRECATED]==
template<int SIZE, int EXPIRATION_COUNT>
class ExipringStdString: public StdString<SIZE>{ 
    protected:
        int myExpirationCounter;  
        
        void reset(){  
            StdString<SIZE>::operator=("");
            myExpirationCounter=0; 
        } 
        
        ExipringStdString<SIZE, EXPIRATION_COUNT>& operator=(const ExipringStdString<SIZE, EXPIRATION_COUNT>& aOtherExpiringStdString){ 
            StdString<SIZE>::operator=(aOtherExpiringStdString.myString);
            myExpirationCounter=aOtherExpiringStdString.myExpirationCounter;
            return *this;
        }

        ExipringStdString(const ExipringStdString<SIZE, EXPIRATION_COUNT>& aOtherExpiringStdString){ 
            *this=aOtherExpiringStdString;
        }; 


    public: 
        ExipringStdString(StdString<SIZE> aString = ""){  
            reset();  
            StdString<SIZE>::operator=(aString);
        } 
  
        ExipringStdString<SIZE, EXPIRATION_COUNT>& operator=(const StdString<SIZE>& aString){ 
            reset();
            StdString<SIZE>::operator=(aString); 
            return *this;
        }  

        ExipringStdString<SIZE, EXPIRATION_COUNT>& operator+=(char aChar) = delete;
       
        ExipringStdString<SIZE, EXPIRATION_COUNT> operator++(int){ 
            ExipringStdString<SIZE, EXPIRATION_COUNT> theOldState=*this;
            myExpirationCounter++; 
            if(myExpirationCounter>EXPIRATION_COUNT)reset(); 
            return theOldState;
        }

}; 
*/