using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
namespace MyApi.Hubs;

[Authorize]
public class KitchenHub : Hub
{
    public Task JoinKitchen() =>
        Groups.AddToGroupAsync(Context.ConnectionId, "kitchen");
}