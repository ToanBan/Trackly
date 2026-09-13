namespace MyApi.Interfaces;

using MyApi.Events;

public interface IRabbitMqPublisher
{
    /// <summary>
    /// Đẩy event "đơn hàng mới" vào exchange trackly.orders.
    /// Publish lỗi không được ném ra ngoài luồng đặt món — bên implement chỉ log.
    /// </summary>
    void PublishOrderCreated(OrderCreatedEvent evt);
}