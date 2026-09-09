namespace MyApi.Interfaces;

public interface IQrCodeInterface
{
    Task<string> GenerateAndSaveAsync(string content, string fileName);
}