using System.ComponentModel.DataAnnotations;

namespace MyApi.DTOS;
public class UserRegisterDTO
{
    public required string Username { get; set; }

    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*@).{9,}$",
        ErrorMessage = "Mật khẩu phải có ít nhất 1 chữ hoa, 1 số, 1 ký tự @, và dài hơn 8 ký tự")]
    public required string Password { get; set; } = string.Empty;
    public required string ConfirmPassword { get; set; }
    public required string Email { get; set; }

    
}