# Pippy is a class that belongs before any import statement. It finds and downloads specified dependencies 
# Use the fetch function to find and retrieve any missing dependencies.
import importlib.util
import subprocess

class Pippy:  
    
    def __init__(self, aLibsToInstall, aFailureHook):  
        self.myLibsToInstall = [aLib for aLib in aLibsToInstall if importlib.util.find_spec(aLib) is None]  
        self.myPackageCounter=0 
        self.myFailureHook=aFailureHook
    def fetch(self):   
        if len(self.myLibsToInstall)==0:  
            self.myFailureHook()
            return 
        try:  
            for aPackage in self.myLibsToInstall:   
                input(f"Press Any Key To Install {aPackage}")
                subprocess.run(["pip" , "install", aPackage]) 
                self.myPackageCounter+=1;   
                print(f"{aPackage} Was Successfully Installed!")
            return True
        except: raise Exception(f"An Error Occured When Trying to Download {self.myLibsToInstall[self.myPackageCounter]}. Ensure This is The Correct Device Name")  
        
        




