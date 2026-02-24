//https://medium.com/@ignatovich.dm/the-javascript-event-loop-explained-with-examples-d8f7ddf0861d
// How the js event loop works
export class RESTapiHelpers{ 
    static RESTGet(aRoute, aCallback){ 
        fetch(aRoute).then((aData)=>aData.json()).then((aData)=>{ 
            aCallback(aData); 
        });
    } 

    static RESTPost(aRoute, aJsonObject, aHeaders={ "Content-Type": "application/json" }){ 
        fetch(aRoute, {
            method: "POST",
            headers: aHeaders,
            body: JSON.stringify(aJsonObject)
        });
    }
}