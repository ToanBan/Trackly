namespace MyApi.Services;

public static class LoyaltyRules
{
    // Mỗi hóa đơn đã thanh toán (có userId) được cộng 100 điểm.
    public const int PointsPerOrder = 100;

    // Ngưỡng điểm tối thiểu để đổi giảm giá.
    public const int RedeemThreshold = 400;

    // Số điểm tiêu mỗi lần đổi.
    public const int RedeemPoints = 400;

    // Phần trăm giảm giá khi dùng 400 điểm.
    public const int DiscountPercent = 10;
}