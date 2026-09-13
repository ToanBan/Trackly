using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using MyApi.Events;
using MyApi.Interfaces;

namespace MyApi.Services;


public class RabbitMqPublisher : IRabbitMqPublisher, IAsyncDisposable
{
    private const string ExchangeName = "trackly.orders";
    private const string QueueName = "kitchen.orders";
    private const string RoutingKey = "order.created";

    private readonly RabbitMqOptions _options;
    private readonly ILogger<RabbitMqPublisher> _logger;
    private readonly SemaphoreSlim _initLock = new(1, 1);

    private IConnection? _connection;
    private IChannel? _channel;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public RabbitMqPublisher(IOptions<RabbitMqOptions> options, ILogger<RabbitMqPublisher> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public void PublishOrderCreated(OrderCreatedEvent evt)
    {
        _ = PublishInternalAsync(evt);
    }

    private async Task PublishInternalAsync(OrderCreatedEvent evt)
    {
        try
        {
            var channel = await GetOrCreateChannelAsync();
            var body = JsonSerializer.SerializeToUtf8Bytes(evt, JsonOptions);

            var properties = new BasicProperties
            {
                ContentType = "application/json",
                DeliveryMode = DeliveryModes.Persistent,
                Type = "order.created",
            };

            await channel.BasicPublishAsync(
                exchange: ExchangeName,
                routingKey: RoutingKey,
                mandatory: false,
                basicProperties: properties,
                body: body);

            _logger.LogInformation(
                "Published OrderCreated for order {OrderId} to {Exchange}/{RoutingKey}",
                evt.OrderId, ExchangeName, RoutingKey);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to publish OrderCreated for order {OrderId}. Order is saved in DB; kitchen view will catch up via polling.",
                evt.OrderId);
        }
    }

    private async Task<IChannel> GetOrCreateChannelAsync()
    {
        if (_channel is { IsOpen: true })
        {
            return _channel;
        }

        await _initLock.WaitAsync();
        try
        {
            if (_channel is { IsOpen: true })
            {
                return _channel;
            }

            var factory = new ConnectionFactory
            {
                HostName = _options.Host,
                Port = _options.Port,
                UserName = _options.Username,
                Password = _options.Password,
                // Tự reconnect + khôi phục topology khi broker chết/restart
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(5),
            };

            if (_connection == null || !_connection.IsOpen)
            {
                _connection?.Dispose();
                _connection = await factory.CreateConnectionAsync();
                _logger.LogInformation("Connected to RabbitMQ at {Host}:{Port}", _options.Host, _options.Port);
            }

            if (_channel == null || !_channel.IsOpen)
            {
                _channel?.Dispose();
                _channel = await _connection.CreateChannelAsync();

                await _channel.ExchangeDeclareAsync(
                    exchange: ExchangeName,
                    type: ExchangeType.Direct,
                    durable: true,
                    autoDelete: false);

                await _channel.QueueDeclareAsync(
                    queue: QueueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false);

                await _channel.QueueBindAsync(
                    queue: QueueName,
                    exchange: ExchangeName,
                    routingKey: RoutingKey);

                _logger.LogInformation(
                    "RabbitMQ topology ready: exchange '{Exchange}' -> queue '{Queue}'",
                    ExchangeName, QueueName);
            }

            return _channel;
        }
        finally
        {
            _initLock.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel != null) await _channel.DisposeAsync();
        if (_connection != null) await _connection.DisposeAsync();
        _initLock.Dispose();
        GC.SuppressFinalize(this);
    }
}

public class RabbitMqOptions
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 5672;
    public string Username { get; set; } = "guest";
    public string Password { get; set; } = "guest";
}