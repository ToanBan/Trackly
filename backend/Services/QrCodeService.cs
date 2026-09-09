namespace MyApi.Services;
using QRCoder;
using MyApi.Interfaces;

public class QrCodeService : IQrCodeInterface
{
    private readonly IWebHostEnvironment _environment;

    public QrCodeService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string>GenerateAndSaveAsync(string content, string fileName)
    {
        var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
        var pngQrCode = new PngByteQRCode(qrCodeData);
        byte[] qrBytes = pngQrCode.GetGraphic(20);
        var folderPath = Path.Combine(_environment.WebRootPath, "qrcodes");
        Directory.CreateDirectory(folderPath);
        var filePath = Path.Combine(folderPath, fileName);
        await File.WriteAllBytesAsync(filePath, qrBytes);
        return $"/qrcodes/{fileName}";
    }

}