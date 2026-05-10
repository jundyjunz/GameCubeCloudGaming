using GameCubeOnline.Capture;
using OpenCvSharp;
using System.Buffers;
using System.Net.WebSockets;
using System.Security.Cryptography;

namespace GameCubeOnline 
{
    static class GameCubeOnlineHelpers
    {
        //This class exists because a websocket in C# needs to recieve messages in order to see that the state of a websocket is closed. 
        // therefore we have this watchdog class for websockets that only send information.
        private class WebSocketWatchDog { 
            protected CancellationTokenSource myCancellationTokenSource;
            protected WebSocket mySocket;
            protected int myRecieveMessageSize;
            public CancellationTokenSource CTS { get => myCancellationTokenSource; }

            public WebSocketWatchDog(WebSocket aSocket, int theRecieveMessageSize=4) {   
                mySocket=aSocket;
                myCancellationTokenSource=new CancellationTokenSource();
                myRecieveMessageSize = theRecieveMessageSize;
                Task.Run(async () => await detectWebsocketClose()); 

            }

            protected async Task detectWebsocketClose()
            {
                try {
                    byte[] theTempArray = ArrayPool<byte>.Shared.Rent(myRecieveMessageSize);
                    WebSocketReceiveResult theMessage;
                    do { theMessage = await mySocket.ReceiveAsync(theTempArray, myCancellationTokenSource.Token); }
                    while (mySocket.State == WebSocketState.Open && theMessage.MessageType == WebSocketMessageType.Close);
                    ArrayPool<byte>.Shared.Return(theTempArray);
                }
                catch { }
                finally { myCancellationTokenSource.Cancel(); }
            }
        }

        private async static Task killSocket(WebSocket aWebSocket, string aConnectionName, int aConnectionId) {
            try { await aWebSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None); } catch { }
            aWebSocket.Dispose();
            Console.WriteLine($"{aConnectionName} {aConnectionId} Disconnected");
        }
       
        public  async static Task sendFrame<T> (IServiceProvider aService, int aClientId, HttpContext aContext) where T: Capture<T>
        {
            WebSocket theWebSocket = await aContext.WebSockets.AcceptWebSocketAsync();
            int theFrameRate = aService.GetRequiredService<GameCubeOnlineSettings>().FrameRate;
            Capture<T> theCapture = aService.GetRequiredService<T>();

            WebSocketWatchDog theWatchDog = new WebSocketWatchDog(theWebSocket);

            try
            {
                while (theWebSocket.State == WebSocketState.Open && !theWatchDog.CTS.Token.IsCancellationRequested)
                {
                    ReadOnlyMemory<byte>? theFrameBytes = theCapture.readFromBuffer(aClientId);
                    if (theFrameBytes.HasValue) await theWebSocket.SendAsync(theFrameBytes.Value, WebSocketMessageType.Binary, true, CancellationToken.None);
                    await Task.Delay(theFrameRate); 
                }
            }
            catch (Exception aException) { Console.WriteLine($"{typeof(T).Name} {aClientId} Encountered Error: {aException.Message}"); }
            finally { await killSocket(theWebSocket, typeof(T).Name, aClientId); }
        }

        public async static Task readBytes(IServiceProvider aService, int aId, HttpContext aContext) {
            // ArrayPool is basically a memory pool you can use instead of making allocations at every turn.
            // Its better than just allocating a bunch of bytes.
            WebSocket theWebSocket = await aContext.WebSockets.AcceptWebSocketAsync();
            int theBytesToWrite = aService.GetRequiredService<ReleaseSerial>()[aId].BytesToWrite;
            SerialWrapper theSerialConnection = aService.GetRequiredService<ReleaseSerial>()[aId];
            byte[] theTempArray = ArrayPool<byte>.Shared.Rent(theBytesToWrite);

            try
            {
                while (theWebSocket.State == WebSocketState.Open)
                {
                    Memory<byte> theTempBytes = new Memory<byte>(theTempArray, 0, theBytesToWrite);
                    var theMessage=await theWebSocket.ReceiveAsync(theTempBytes, CancellationToken.None);
                    theSerialConnection.read(theTempBytes);
                    if (theMessage.MessageType == WebSocketMessageType.Close) break;
                }
                ArrayPool<byte>.Shared.Return(theTempArray);

            }
            catch (Exception aException) { Console.WriteLine($"Controller {aId} Encountered Error: {aException.Message}"); }
            finally { await killSocket(theWebSocket, "Controller", aId); }
        }
    }
}
