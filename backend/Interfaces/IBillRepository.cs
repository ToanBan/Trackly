namespace MyApi.Interfaces;

using MyApi.Models;

public interface IBillRepository
{
    public Task<Bills> AddBillAsync(Bills bill);
    public Task<Bills?> GetBillByTableOpenAsync(int tableId);
    public Task<Bills?> GetBillByIdAsync(int id);
    public Task<Bills?> UpdateBillAsync(Bills bill);
    public Task<List<Bills>> GetBillsAsync(int offset, int limit);
    public Task<Bills?> GetOpenBillForUpdateAsync(int tableId);
}