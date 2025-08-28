import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

const Otp = () => {
  const { otpVerify, error, clearError } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as { email?: string };
    const emailFromState = state?.email;

    if (!emailFromState) {
      navigate("/login");
      return;
    }
    setEmail(emailFromState);
  }, [location.state, navigate]);

  const onVerify = async () => {
    clearError();
    try {
      const msg = await otpVerify(email, otp);
      setSuccessMessage(msg);
      navigate("/reset-password", {state: { email }});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Balanced Plate
            <span className="text-green-600 dark:text-green-500">.AI</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the verification code
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            Verify your email
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            We sent a 6-digit code to{" "}
            <span className="font-medium">{email || "your email"}</span>
          </p>

          {successMessage && (
            <Alert variant="default" className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mb-4">
            <InputOTP
              maxLength={6}
              className="gap-2 sm:gap-4"
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={onVerify}
            className="w-full bg-green-600"
            disabled={!otp || otp.length < 6}
          >
            Verify OTP
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Need help?{" "}
            <a
              href="/login"
              className="text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 font-medium"
            >
              Sign in instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Otp;
