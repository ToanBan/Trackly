namespace MyApi.Services;

using MyApi.Interfaces;
using MyApi.Models;
using MyApi.Helpers;

public class TablesService
{
    private readonly ITablesRepository _tablesRepository;
    private readonly IQrCodeInterface _qrcodeService;

    private readonly IJwtTokenService _jwtTokenService;
    private readonly IWebHostEnvironment _environment;


    public TablesService(ITablesRepository tablesRepository, IQrCodeInterface qrcodeService, IJwtTokenService jwtTokenService, IWebHostEnvironment environment)
    {
        _tablesRepository = tablesRepository;
        _qrcodeService = qrcodeService;
        _jwtTokenService = jwtTokenService;
        _environment = environment;
    }

    public async Task<Tables> AddTableAsync(string tableNumber)
    {
        var slug = GenUuid.GenerateUuid();
        string content = $"http://localhost:5173?table={slug}";
        string fileName = $"{slug}.png";
        string qrCodeUrl = await _qrcodeService.GenerateAndSaveAsync(content, fileName);
        var table = new Tables
        {
            TableNumber = tableNumber,
            Slug = slug,
            Status = "available",
            QrCodeUrl = qrCodeUrl,
            CreatedAt = DateTime.UtcNow
        };
        return await _tablesRepository.AddTableAsync(table);

    }


    public async Task<string?> GetCurrentSessionTableAsync(string slug)
    {
        var existed = await _tablesRepository.GetTableBySlugAsync(slug);
        if (existed == null)
        {
            return null;
        }

        // Khách quét QR = bắt đầu phiên ngồi -> bàn chuyển sang occupied.
        // Idempotent: quét lại nhiều lần (refresh, người khác cùng bàn) vẫn OK.
        // Lỗi chỉ log — việc chính là cấp token cho khách vào menu, không chặn.
        try
        {
            await _tablesRepository.UpdateTableStatusAsync(existed.Id, "occupied");
        }
        catch (Exception ex)
        {
            // TablesService chưa có logger riêng — để lỗi nổi qua controller? Không:
            // nuốt để không chặn cấp token.
            Console.WriteLine($"[TablesService] Update table status failed: {ex.Message}");
        }

        return _jwtTokenService.GenerateTableToken(slug);
    }


    public async Task<Tables> GetTableByIdAsync(int Id)
    {
        var existed = await _tablesRepository.GetTableByIdAsync(Id);
        if(existed == null)
        {
            throw new Exception("table not found");
        }
        return existed;
    }

    public async Task<Tables?> UpdateTableByIdAsync(int Id, Tables table)
    {
        var existed = await _tablesRepository.GetTableByIdAsync(Id);
        if(existed == null)
        {
            return null;
        }

        if (!string.IsNullOrEmpty(existed.QrCodeUrl)
            && !string.IsNullOrEmpty(table.QrCodeUrl)
            && existed.QrCodeUrl != table.QrCodeUrl)
        {
            var fileName = Path.GetFileName(existed.QrCodeUrl); 
            var qrFolder = Path.Combine(_environment.WebRootPath, "qrcodes");
            var oldFilePath = Path.Combine(qrFolder, fileName);

            if (File.Exists(oldFilePath))
            {
                File.Delete(oldFilePath);
            }
        }

        return await _tablesRepository.UpdateTableAsync(Id, table);
    }

    public async Task<List<Tables>> GetTablesAsync(int page = 1, int limit = 10)
    {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        var offset = (page - 1) * limit;
        return await _tablesRepository.GetTablesAsync(offset, limit);
    }

    public async Task<bool>DeleteTableByIdAsync(int Id)
    {
        var existed = await _tablesRepository.GetTableByIdAsync(Id);
        if(existed == null)
        {
            return false;
        }

        if (!string.IsNullOrEmpty(existed.QrCodeUrl))
        {
            var fileName = Path.GetFileName(existed.QrCodeUrl); 
            var qrFolder = Path.Combine(_environment.WebRootPath, "qrcodes");
            var filePath = Path.Combine(qrFolder, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        return await _tablesRepository.DeleteTableAsync(Id);
    }

}