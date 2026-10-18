namespace BuildingBlocks.Common.Primitives;

/// <summary>
/// Result Pattern chuẩn hóa response trả về từ Command / Query Handler, thay thế việc throw Exception tùy tiện.
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public bool IsFailure => !IsSuccess;

    protected Result(bool isSuccess, string? error)
    {
        if (isSuccess && !string.IsNullOrEmpty(error))
            throw new InvalidOperationException("Thao tác thành công không thể chứa thông báo lỗi.");
        if (!isSuccess && string.IsNullOrEmpty(error))
            throw new InvalidOperationException("Thao tác thất bại bắt buộc phải có thông báo lỗi.");

        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

public class Result<T> : Result
{
    private readonly T? _value;

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Không thể truy cập Value khi kết quả thất bại.");

    protected Result(T? value, bool isSuccess, string? error) : base(isSuccess, error)
    {
        _value = value;
    }

    public static Result<T> Success(T value) => new(value, true, null);
    public new static Result<T> Failure(string error) => new(default, false, error);
}
