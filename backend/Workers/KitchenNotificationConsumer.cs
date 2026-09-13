using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using MyApi.Events;
using MyApi.Hubs;
using MyApi.Services;
namespace MyApi.Workers;

public class KitchenNotificationConsumer : BackgroundService
{
    private const string ExchangeName = "trackly.orders";
    private const string QueueName = "kitchen.orders";
    private const string RoutingKey = "order.created";

    private readonly IHubContext<KitchenHub> _hubContext;
    private readonly RabbitMqOptions _options;
    private readonly ILogger<KitchenNotificationConsumer> _logger;

    private IConnection? _connection;
    private IChannel? _channel;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public KitchenNotificationConsumer(
        IHubContext<KitchenHub> hubContext,
        Microsoft.Extensions.Options.IOptions<RabbitMqOptions> options,
        ILogger<KitchenNotificationConsumer> logger)
    {
        _hubContext = hubContext;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ConsumeAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "RabbitMQ consumer failed. Retrying in 5 seconds...");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private async Task ConsumeAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = _options.Host,
            Port = _options.Port,
            UserName = _options.Username,
            Password = _options.Password,
            AutomaticRecoveryEnabled = true,
            NetworkRecoveryInterval = TimeSpan.FromSeconds(5),
        };

        _connection = await factory.CreateConnectionAsync(stoppingToken);
        _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

        await _channel.ExchangeDeclareAsync(
            exchange: ExchangeName, type: ExchangeType.Direct,
            durable: true, autoDelete: false, cancellationToken: stoppingToken);

        await _channel.QueueDeclareAsync(
            queue: QueueName, durable: true, exclusive: false,
            autoDelete: false, cancellationToken: stoppingToken);

        await _channel.QueueBindAsync(
            queue: QueueName, exchange: ExchangeName,
            routingKey: RoutingKey, cancellationToken: stoppingToken);

        await RegisterConsumerAsync(stoppingToken);

        _logger.LogInformation("KitchenNotificationConsumer listening on queue '{Queue}'", QueueName);

        // Giữ consumer sống tới khi app shutdown.
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }

    private async Task RegisterConsumerAsync(CancellationToken stoppingToken)
    {
        var consumer = new AsyncEventingBasicConsumer(_channel!);
        consumer.ReceivedAsync += OnMessageReceivedAsync;

        await _channel!.BasicConsumeAsync(
            queue: QueueName,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);
    }

    private async Task OnMessageReceivedAsync(object sender, BasicDeliverEventArgs ea)
    {
        var deliveryTag = ea.DeliveryTag;
        try
        {
            var evt = JsonSerializer.Deserialize<OrderCreatedEvent>(ea.Body.Span, JsonOptions);
            if (evt == null)
            {
                _logger.LogWarning("Received empty/invalid OrderCreated event. Dropping message.");
                await _channel!.BasicNackAsync(deliveryTag, multiple: false, requeue: false);
                return;
            }

            await _hubContext.Clients
                .Group("kitchen")
                .SendAsync("orderCreated", evt);

            await _channel!.BasicAckAsync(deliveryTag, multiple: false);

            _logger.LogInformation(
                "OrderCreated for order {OrderId} pushed to kitchen group. Acked.",
                evt.OrderId);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize OrderCreated event. Dropping message.");
            await _channel!.BasicNackAsync(deliveryTag, multiple: false, requeue: false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to push OrderCreated (delivery tag {DeliveryTag}) to kitchen. Requeueing for retry.",
                deliveryTag);
            await _channel!.BasicNackAsync(deliveryTag, multiple: false, requeue: true);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_channel != null) await _channel.CloseAsync(cancellationToken);
        if (_connection != null) await _connection.CloseAsync(cancellationToken);
        await base.StopAsync(cancellationToken);
    }

    public override void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
        base.Dispose();
    }
}