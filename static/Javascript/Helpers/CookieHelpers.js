export class CookieHelpers{ 
    static #findAndOperateOnCookie(aCookieName, aFunc){ 
        document.cookie.split(';').forEach( (aCookieVar)=>{ 
            let aKeyValuePair=aCookieVar.split('=');
            if(aKeyValuePair[0]==aCookieName) aFunc(aKeyValuePair[1]);
        });
    }
   
    static getCookie(aCookieName){ 
        let theJsonObject=null;  
        CookieHelpers.#findAndOperateOnCookie(aCookieName, (aCookieVar)=>{theJsonObject = JSON.parse(decodeURIComponent(aCookieVar))});
        return theJsonObject;
    }  

    static putCookie(aCookieName, aJsonElement, aMaxAge=(60*60*24*7*365)){ 
        /* 
        encode as uricompoent to avoid having characters like { : " etc.
        max age is when the cookie expires in seconds.
        writes take care of one variable at a time, so using "=" is fine 
        but reads do the entire string. 
        */
        document.cookie=`${aCookieName}=${encodeURIComponent(JSON.stringify(aJsonElement))} ; path=/ ; max-age=${aMaxAge}`
    }

    static deleteCookie(aCookieName){ 
        document.cookie=`${aCookieName}=; Max-Age=0; path=/`;
    }
}