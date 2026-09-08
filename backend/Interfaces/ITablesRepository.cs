namespace MyApi.Interfaces;

using Microsoft.EntityFrameworkCore.Metadata.Internal;
using MyApi.Models;
public interface ITablesRepository{

    public Task<Tables>AddTableAsync(Tables table);
    public Task<bool>DeleteTableAsync(int id);
    public Task<Tables>UpdateTableAsync(int id, Tables table);

    public Task<Tables?>GetTableByIdAsync(int id);

}