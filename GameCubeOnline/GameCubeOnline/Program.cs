using GameCubeOnline;
using GameCubeOnline.Capture;
using Microsoft.Extensions.FileProviders;
using System.Net.WebSockets;
using System.Runtime;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(aService => (new GameCubeOnlineSettings())
                                            .buildBufferSize(10)
                                            .buildStaticFiles(builder, "static")
                                            .buildFrameRate(16)
                                            .buildInit()); 

builder.Services.AddSingleton(aService =>(new CaptureVideo(aService.GetRequiredService<GameCubeOnlineSettings>().BufferSize, 500, 400)) 
                                            .buildFrameRate(aService.GetRequiredService<GameCubeOnlineSettings>().FrameRate)
                                            .buildVideoSource(0)
                                            .buildVideoQuality(70)
                                            .buildInit()); 

builder.Services.AddSingleton(aService=>(new CaptureAudio(aService.GetRequiredService<GameCubeOnlineSettings>().BufferSize, 4096, 2, 4))
                                            .buildFrameRate(aService.GetRequiredService<GameCubeOnlineSettings>().FrameRate)
                                            .buildStreamParameters(new GuermokRuleSet())
                                            .buildStream()
                                            .buildInit()); 

builder.Services.AddSingleton(aService => (new ReleaseSerial())
                                            .buildBaudRate(250000)
                                            .buildReadTimeout(-1)
                                            .buildWriteTimeout(-1)
                                            .buildSerialConnection(0xFA, 5)
                                            .buildInit());

var app = builder.Build();
app.UseWebSockets(); 
//How to change base static file directory
//https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-10.0
app.UseStaticFiles(new StaticFileOptions{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "static")),
    RequestPath = "/static"
});

app.MapGet("/", async (IServiceProvider aService) => {
    return Results.File( aService.GetRequiredService<GameCubeOnlineSettings>().getFileAt("/HTML/GameCubeOnline.html"),  "text/html"); 

});

app.MapGet("/subscribe_audio", async (IServiceProvider aService) =>{
    return Results.Json( new { audioClientId = aService.GetRequiredService<CaptureAudio>().subscribeToBuffer()});
});

app.MapGet("/subscribe_video", async (IServiceProvider aService) =>{
    return Results.Json(new { videoClientId = aService.GetRequiredService<CaptureVideo>().subscribeToBuffer() });
});

app.MapGet("/audio_metadata", async (IServiceProvider aService) => {
    return Results.Json(new { sampleRate = aService.GetRequiredService<CaptureAudio>().SampleRate, channels =  aService.GetRequiredService<CaptureAudio>().ChannelCount }); 
});

app.MapGet("/serial_connections_ct", async (IServiceProvider aService) =>{
    return Results.Json(new { count = aService.GetRequiredService<ReleaseSerial>().PortCount });
});

app.Map("/frame_data/{aClientId}", async (IServiceProvider aService, int aClientId, HttpContext aContext) => {
    await GameCubeOnlineHelpers.sendFrame<CaptureVideo>(aService, aClientId, aContext);
});

app.Map("/audio_data/{aClientId}", async (IServiceProvider aService, int aClientId, HttpContext aContext) => {
    await GameCubeOnlineHelpers.sendFrame<CaptureAudio>(aService, aClientId, aContext);
});

app.Map("/serial_post/{aId}", async (IServiceProvider aService, int aId, HttpContext aContext) =>{
    await GameCubeOnlineHelpers.readBytes(aService, aId, aContext);
});

app.Run();
