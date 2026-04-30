using GameCubeOnline.Capture;
using System.Buffers;
using System.Net.WebSockets;

namespace GameCubeOnline 
{
    static class GameCubeOnlineHelpers
    {
        public  async static Task sendFrame<T> (IServiceProvider aService, int aClientId, HttpContext aContext) where T: Capture<T>
        {
            WebSocket theWebSocket = await aContext.WebSockets.AcceptWebSocketAsync();
            int theFrameRate = aService.GetRequiredService<GameCubeOnlineSettings>().FrameRate;
            Capture<T> theCapture = aService.GetRequiredService<T>();

            try
            {
                while (theWebSocket.State == WebSocketState.Open)
                {
                    ReadOnlyMemory<byte>? theFrameBytes = theCapture.readFromBuffer(aClientId);
                    if(theFrameBytes.HasValue) await theWebSocket.SendAsync(theFrameBytes.Value, WebSocketMessageType.Binary, true, CancellationToken.None);
                    await Task.Delay(theFrameRate);
                }

            }
            catch (WebSocketException aException) { Console.WriteLine($"Client {aClientId} Disconnected With Error: \n\n {aException.WebSocketErrorCode}"); }
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
                    await theWebSocket.ReceiveAsync(theTempBytes, CancellationToken.None);
                    theSerialConnection.read(theTempBytes); 
                }

            }
            catch (WebSocketException aException) { Console.WriteLine($"Controller {aId} Disconnected With Error: \n\n {aException.WebSocketErrorCode}"); }
            finally { ArrayPool<byte>.Shared.Return(theTempArray); }

        }
    }
}
