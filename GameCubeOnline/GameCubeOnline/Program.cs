using GameCubeOnline;
using GameCubeOnline.Capture;
using Microsoft.Extensions.FileProviders;
using System.Net.WebSockets;
using System.Runtime;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddSingleton(aService => (new GameCubeOnlineSettings())
                                            .buildStaticFiles(builder, "static")
                                            .buildSettings("GameCubeOnlineSettingsJSON.json")
                                            .buildInit()); 

builder.Services.AddSingleton(aService =>(new CaptureVideo( 
                                                aService.GetRequiredService<GameCubeOnlineSettings>().VideoBufferSize,
                                                aService.GetRequiredService<GameCubeOnlineSettings>().FrameWidth,
                                                aService.GetRequiredService<GameCubeOnlineSettings>().FrameHeight 
                                             )) 
                                            .buildFrameRate(aService.GetRequiredService<GameCubeOnlineSettings>().VideoFrameRate)
                                            .buildVideoSource(aService.GetRequiredService<GameCubeOnlineSettings>().VideoSource)
                                            .buildVideoQuality( 
                                                aService.GetRequiredService<GameCubeOnlineSettings>().VideoQuality,  
                                                aService.GetRequiredService<GameCubeOnlineSettings>().UseHuffmanOptimization,
                                                aService.GetRequiredService<GameCubeOnlineSettings>().UseProgressiveScan)
                                            .buildInit()); 

builder.Services.AddSingleton(aService=>(new CaptureAudio( 
                                                aService.GetRequiredService<GameCubeOnlineSettings>().AudioBufferSize,
                                                aService.GetRequiredService<GameCubeOnlineSettings>().FramesPerBuffer,
                                                aService.GetRequiredService<GameCubeOnlineSettings>().ChannelCount,
                                                aService.GetRequiredService<GameCubeOnlineSettings>().SampleByteSize
                                             ))
                                            .buildFrameRate(aService.GetRequiredService<GameCubeOnlineSettings>().AudioFrameRate)
                                            .buildStreamParameters(aService.GetRequiredService<GameCubeOnlineSettings>().AudioRuleSet)
                                            .buildStream()
                                            .buildInit()); 

builder.Services.AddSingleton(aService => (new ReleaseSerial())
                                            .buildBaudRate(aService.GetRequiredService<GameCubeOnlineSettings>().BaudRate)
                                            .buildReadTimeout(aService.GetRequiredService<GameCubeOnlineSettings>().ReadTimeout)
                                            .buildWriteTimeout(aService.GetRequiredService<GameCubeOnlineSettings>().WriteTimeout)
                                            .buildCommandSendSleepTime(aService.GetRequiredService<GameCubeOnlineSettings>().CommandSendSleepTime)
                                            .buildSerialConnection( 
                                                aService.GetRequiredService<GameCubeOnlineSettings>().ConnectCode,
                                                aService.GetRequiredService<GameCubeOnlineSettings>().CommandByteLen) 
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
    return Results.File( aService.GetRequiredService<GameCubeOnlineSettings>().getFileAt(Path.Combine("HTML","GameCubeOnline.html")),  "text/html"); 

});

app.MapPost("/get_hash", async (IServiceProvider aService, GameCubeOnlineHelpers.LockMatrixObject aData) => {
    return await GameCubeOnlineHelpers.getHash(aService, aData);
});

app.MapPost("/check_hash", async (IServiceProvider aService, GameCubeOnlineHelpers.HashObject aData) => {
    return (aService.GetRequiredService<GameCubeOnlineSettings>().Hashes.Contains(aData.hash)) ? Results.Json(new { hash = aData.hash}) : Results.Json(new { hash = (string?)null }); ;
});

app.MapGet("/subscribe_audio", async (IServiceProvider aService) =>{
    return Results.Json( new { audioClientId = aService.GetRequiredService<CaptureAudio>().subscribeToBuffer()});
});

app.MapGet("/subscribe_video", async (IServiceProvider aService) =>{
    return Results.Json(new { videoClientId = aService.GetRequiredService<CaptureVideo>().subscribeToBuffer() });
});

app.MapGet("/subscribe_port/{aId}", async (IServiceProvider aService, int aId) =>{
    return Results.Json(new { portClientId = aService.GetRequiredService<ReleaseSerial>()[aId].subscribeToPort() });
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

app.Map("/serial_post/{aId}/{aClientId}", async (IServiceProvider aService, int aId, int aClientId, HttpContext aContext) =>{
    await GameCubeOnlineHelpers.readBytes(aService, aId, aClientId,  aContext);
});

app.Run();

