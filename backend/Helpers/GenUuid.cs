namespace MyApi.Helpers;

public class GenUuid
{
    public static string GenerateUuid()
    {
        return Guid.NewGuid().ToString();
    }
}