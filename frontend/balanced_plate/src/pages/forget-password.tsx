import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";

const forgetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;

const ForgetPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgetPassword, error, clearError } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgetPasswordFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage("");
    try {
      const msg = await forgetPassword(data.email);
      setSuccessMessage(msg);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg relative overflow-hidden">
            {/* AI Circuit Pattern Background */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
                <circle cx="20" cy="20" r="2" fill="white"/>
                <circle cx="60" cy="20" r="2" fill="white"/>
                <circle cx="40" cy="40" r="3" fill="white"/>
                <circle cx="20" cy="60" r="2" fill="white"/>
                <circle cx="60" cy="60" r="2" fill="white"/>
                <line x1="20" y1="20" x2="38" y2="38" stroke="white" strokeWidth="1"/>
                <line x1="60" y1="20" x2="42" y2="38" stroke="white" strokeWidth="1"/>
                <line x1="40" y1="43" x2="20" y2="60" stroke="white" strokeWidth="1"/>
                <line x1="40" y1="43" x2="60" y2="60" stroke="white" strokeWidth="1"/>
              </svg>
            </div>
            {/* Main Logo */}
            <div className="relative z-10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="currentColor">
                {/* Plate */}
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                {/* Food sections with AI nodes */}
                <path d="M16 6 L24 12 L20 16 L16 16 Z" fill="currentColor" opacity="0.7"/>
                <path d="M24 12 L26 20 L20 16 Z" fill="currentColor" opacity="0.5"/>
                <path d="M26 20 L16 26 L20 16 Z" fill="currentColor" opacity="0.6"/>
                <path d="M16 26 L8 20 L16 16 L20 16 Z" fill="currentColor" opacity="0.7"/>
                <path d="M8 20 L6 12 L16 16 Z" fill="currentColor" opacity="0.5"/>
                <path d="M6 12 L16 6 L16 16 Z" fill="currentColor" opacity="0.6"/>
                {/* AI Brain center */}
                <circle cx="16" cy="16" r="3" fill="white"/>
                <circle cx="14" cy="14" r="0.5" fill="currentColor"/>
                <circle cx="18" cy="14" r="0.5" fill="currentColor"/>
                <circle cx="16" cy="18" r="0.5" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Balanced Plate<span className="text-green-600">.AI</span>
          </h1>
          <p className="text-gray-600">Your AI-powered nutrition companion</p>
        </div>

        {/* Forget Password Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Forgot Password?</h2>
          <p className="text-center text-gray-600 mb-6">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {successMessage && (
                <div className="p-3 rounded bg-green-50 text-green-700 text-sm">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-white transition-all duration-200"
                        disabled={isSubmitting}
                        onChange={(e) => {
                          field.onChange(e);
                          if (error) clearError();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-600 text-white py-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reset Instructions
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Back to Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{" "}
            <a href="/login" className="text-green-600 hover:text-green-500 font-medium transition-colors">
              Back to login
            </a>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">Secure Password Reset Process</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <span className="text-green-600">🔒</span>
              <span>Encrypted</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600">⚡</span>
              <span>Quick Process</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600">✉️</span>
              <span>Email Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;