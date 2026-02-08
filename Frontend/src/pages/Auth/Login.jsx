import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiPhone, FiKey } from "react-icons/fi";
import useAuthStore from "../../store/authStore";
import {
  sanitizeInput,
  validatePhone,
  validateOTP,
} from "../../utils/security";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const from = location.state?.from?.pathname || "/";

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handlePhoneChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setPhoneNumber(value);
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      setErrors({ phoneNumber: "Phone number is required" });
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setErrors({ phoneNumber: "Invalid phone number format" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Simulate API call - Replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, call: await api.auth.sendOTP(phoneNumber)
      console.log("OTP sent to:", phoneNumber);

      setStep(2);
      setResendTimer(60); // 60 seconds cooldown
    } catch (error) {
      setErrors({ submit: "Failed to send OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    if (!validateOTP(otp)) {
      setErrors({ otp: "Invalid OTP format. Please enter 6 digits." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Simulate API call - Replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, call: await api.auth.verifyOTP(phoneNumber, otp)
      const mockUser = {
        id: 1,
        name: "User",
        phoneNumber: phoneNumber,
        email: "",
      };

      console.log("OTP verified for:", phoneNumber);
      setUser(mockUser);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ otp: "Invalid OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendTimer(60);
    setOtp("");
    await handleSendOTP(new Event("submit"));
  };

  return (
    <>
      <Helmet>
        <title>Login - E-Shoe</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 1 ? "Welcome" : "Verify OTP"}
            </h2>
            <p className="mt-2 text-gray-600">
              {step === 1
                ? "Enter your phone number to continue"
                : `Enter the OTP sent to ${phoneNumber}`}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {errors.submit}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="input-field pl-10"
                      placeholder="+1 (234) 567-8900"
                      maxLength={20}
                      autoComplete="tel"
                      autoFocus
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <FiKey
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={handleOtpChange}
                      className="input-field pl-10 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Continue"
                  )}
                </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Change phone number
                  </button>

                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                By continuing, you agree to our{" "}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>🔒 Secure OTP-based authentication</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
