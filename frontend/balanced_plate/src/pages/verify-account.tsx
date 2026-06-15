import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, MailCheck, RefreshCw } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyAccount = () => {
  const {
    verifyAccount,
    resendAccountVerificationOtp,
    error,
    clearError,
    isLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateEmail = (location.state as { email?: string } | null)?.email;
  const initialEmail = useMemo(
    () => stateEmail || searchParams.get("email") || "",
    [stateEmail, searchParams]
  );

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const onVerify = async () => {
    clearError();
    setSuccessMessage("");
    setResendMessage("");

    try {
      const msg = await verifyAccount(email.trim(), otp);
      setSuccessMessage(msg);
      setTimeout(() => {
        navigate("/login", { replace: true, state: { verified: true, email } });
      }, 900);
    } catch (err) {
      console.error(err);
    }
  };

  const onResend = async () => {
    clearError();
    setSuccessMessage("");
    setResendMessage("");

    try {
      const msg = await resendAccountVerificationOtp(email.trim());
      setResendMessage(msg);
    } catch (err) {
      console.error(err);
    }
  };

  const canVerify = email.trim().length > 0 && otp.length === 6 && !isLoading;
  const canResend = email.trim().length > 0 && !isLoading;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <MailCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Balanced Plate
            <span className="text-emerald-600 dark:text-emerald-500">.AI</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Confirm your email to activate your account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            Verify your account
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Enter the 6-digit code sent to your email address.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default" className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {resendMessage && (
            <Alert variant="default" className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
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
              disabled={!canVerify}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify Account
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onResend}
              disabled={!canResend}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend Code
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already verified?{" "}
            <a
              href="/login"
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
