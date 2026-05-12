import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Mail, ArrowRight } from "lucide-react";

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/auth/register");
    }
  }, [email, navigate]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newValues = [...otpValues];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newValues[index + i] = char;
      });
      setOtpValues(newValues);
      
      // Focus last filled or next empty
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = otpValues.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otpCode: fullOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      } else {
        setError(data.message || "Xác thực thất bại!");
      }
    } catch (err) {
      setError("Không thể kết nối đến server. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="p-10 border-[3px] shadow-brutal">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-brutal">
                <Mail size={32} />
              </div>
              <h1 className="font-serif text-3xl font-bold mb-3">
                Xác thực tài khoản
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                Chúng tôi đã gửi mã OTP đến email <br />
                <span className="font-bold text-black underline decoration-2">{email}</span>. <br />
                Vui lòng nhập mã để kích hoạt tài khoản.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 text-red-700 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="mb-4 text-green-600 font-bold text-2xl uppercase tracking-widest">
                  Xác thực thành công!
                </div>
                <p className="text-gray-600 mb-6 font-medium">
                  Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng đến
                  trang đăng nhập...
                </p>
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="flex justify-between gap-2">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-16 text-center text-2xl font-black bg-white border-[3px] border-black rounded-none focus:outline-none focus:bg-yellow-200 transition-colors shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      required
                    />
                  ))}
                </div>

                <Button
                  className="w-full uppercase tracking-widest py-5 text-lg font-black border-[3px] border-black transition-all"
                  type="submit"
                  disabled={loading || fullOtp.length !== 6}
                >
                  {loading ? "ĐANG XÁC THỰC..." : "KÍCH HOẠT TÀI KHOẢN"}
                </Button>

                <div className="text-center mt-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Mã OTP có hiệu lực trong 15 phút.
                  </p>
                  <button
                    type="button"
                    className="text-xs font-black text-black mt-2 hover:underline uppercase tracking-tighter"
                    onClick={() => alert("Chức năng gửi lại mã đang phát triển")}
                  >
                    Gửi lại mã xác thực
                  </button>
                </div>
              </form>
            )}

            <div className="mt-10 text-center pt-8 border-t-2 border-black border-dashed">
              <button
                onClick={() => navigate("/auth/register")}
                className="text-xs font-black text-gray-500 hover:text-black flex items-center justify-center gap-2 mx-auto uppercase tracking-widest"
              >
                <ArrowRight size={14} className="rotate-180" /> Quay lại đăng ký
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTP;
