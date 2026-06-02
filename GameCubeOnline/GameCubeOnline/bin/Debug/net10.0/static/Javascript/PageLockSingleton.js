import { BuilderWarning } from "/static/Javascript/BuilderWarning.js";
import { CookieHelpers } from "/static/Javascript/Helpers/CookieHelpers.js";
import { RESTapiHelpers } from "/static/Javascript/Helpers/RESTapiHelpers.js";

export class PageLockSingleton {
    static #myInstance = null;  

    #myLockResolve;
    #myMultiToggleArray;
    #mySubmitButton;
    #myErrorRect; 
    #myGetHashRoute; 
    #myCheckHashRoute
    #myCookieName; 
    #myCookieExpiry; 
    #myDestroyClassName; 
    #myLockMatrix; 

    constructor() {
        if (PageLockSingleton.#myInstance) {
            console.log("Attempted to access PageLockSingleton's constructor!");
            return;
        }
        this.#myLockResolve = null;
        this.#myMultiToggleArray = [] 
        this.#mySubmitButton =null ;
        this.#myErrorRect = null;
        this.#myGetHashRoute = null;
        this.#myCookieName = null;
        this.#myCookieExpiry = null;
        this.#myDestroyClassName = null; 
        this.#myCheckHashRoute = null;

        this.#myLockMatrix = [];   
    } 

    

    static #enablePageLock() {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        document.querySelectorAll(this.#myInstance.#myDestroyClassName).forEach((aElement) => { aElement.style.visibility = "visible"; });
    } 
    static #destroyPageLock() {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        document.querySelectorAll(this.#myInstance.#myDestroyClassName).forEach((aElement) => { aElement.remove(); }); 
        this.#myInstance.#myLockResolve();
    }

    static checkPageLock() {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  

        // returns a promise that needs to be resolved.
        // resolve is saved by checklock, and will eventually be dealt with by destroying the pagelock. 
        // this check is highly secure, the hash needs to be correct before anything happens, which is obtained by communicating with the server for the correct hash.
        return new Promise((aResolve) => { 
            this.#myInstance.#myLockResolve = aResolve;
            let theHash = CookieHelpers.getCookie(this.#myInstance.#myCookieName);
            if (!theHash) { this.#enablePageLock(); return; }
            RESTapiHelpers.RESTPost(this.#myInstance.#myCheckHashRoute, { hash: theHash }, (aData) => {
                if (aData.hash && theHash == aData.hash) { this.#destroyPageLock(); }
                else this.#enablePageLock();
            });  
        });
    }

    static setInit() {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  

        (new BuilderWarning(!this.#myInstance.#myGetHashRoute))             .setRequired(this.setGetHashRoute).enforce();
        (new BuilderWarning(!this.#myInstance.#myCheckHashRoute))           .setRequired(this.setCheckHashRoute).enforce();
        (new BuilderWarning(!this.#myInstance.#myErrorRect))                .setRequired(this.setErrorRect).enforce();
        (new BuilderWarning(this.#myInstance.#myMultiToggleArray.length==0)).setRequired(this.setMultiToggle).enforce();
        (new BuilderWarning(!this.#myInstance.#myCookieName))               .setRequired(this.setCookieName).enforce();
        (new BuilderWarning(!this.#myInstance.#myCookieExpiry))             .setRequired(this.setCookieExpiry).enforce();
        (new BuilderWarning(!this.#myInstance.#myDestroyClassName))         .setRequired(this.setDestroyClassName).enforce();
        (new BuilderWarning(!this.#myInstance.#mySubmitButton))             .setRequired(this.setSubmitButton).enforce("Call this last when creating a PageLock!");
    } 

    static setMultiToggle(aMultiToggle) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  

        let theRow = this.#myInstance.#myMultiToggleArray.length;  
        this.#myInstance.#myMultiToggleArray.push(aMultiToggle);
        let theColumnWidth = aMultiToggle.getMultiToggleLength();  
        this.#myInstance.#myLockMatrix.push(new Array(theColumnWidth).fill(0)); 
        aMultiToggle.setFunc((aColumnNumber) => {
            this.#myInstance.#myLockMatrix[theRow].fill(0);
            if (aColumnNumber != null) this.#myInstance.#myLockMatrix[theRow][aColumnNumber] = 1;
        }).setInit(); 
    } 

    static #submitButtonHandler() {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  

        RESTapiHelpers.RESTPost(this.#myInstance.#myGetHashRoute, { lockmatrix: this.#myInstance.#myLockMatrix }, (aData) => {

            if (!aData.hash) { this.#myInstance.#myErrorRect.enableError("Wrong Code Entered", () => { }); return;}
            CookieHelpers.putCookie(this.#myInstance.#myCookieName, aData.hash, this.#myInstance.#myCookieExpiry);
            this.#destroyPageLock();
            
        });  
    }

    static setSubmitButton(aSubmitButton) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        aSubmitButton.setClickFunc(() => { this.#submitButtonHandler() }).setInit() 
        this.#myInstance.#mySubmitButton = aSubmitButton;
    } 
    static setErrorRect(aErrorRect) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        aErrorRect.setInit()  
        this.#myInstance.#myErrorRect = aErrorRect;
    } 
    static setGetHashRoute(aGetHashRoute) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        this.#myInstance.#myGetHashRoute = aGetHashRoute;
    } 
    static setCheckHashRoute(aCheckHashRoute) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        this.#myInstance.#myCheckHashRoute = aCheckHashRoute;
    } 

    static setCookieName(aCookieName) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        this.#myInstance.#myCookieName = aCookieName;
    } 
    static setCookieExpiry(aCookieExpiry) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        this.#myInstance.#myCookieExpiry= aCookieExpiry;
    } 
    static setDestroyClassName(aDestroyClassName) {
        if (!this.#myInstance) this.#myInstance = new PageLockSingleton();  
        this.#myInstance.#myDestroyClassName = aDestroyClassName;
    } 
    

}