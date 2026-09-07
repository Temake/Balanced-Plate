import { useState } from "react";
import { useForm } from "react-hook-form";
import {  z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const forgetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;

const ForgetPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgetPassword, error, clearError } = useAuth();
  const navigate = useNavigate();
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
    if (msg) {
      setSuccessMessage("");
        navigate("/otp", { state: { email: data.email } });
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              className="h-10 w-10 rounded-2xl object-contain"
              alt="NutriLens Logo"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            NutriLens
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Your Nigerian food accountability companion</p>
        </div>

        {/* Forget Password Card */}
        <div className="bg-white rounded-2xl p-8 border dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center dark:text-white">
            Forgot Password?
          </h2>
          <p className="text-center text-gray-600 mb-6 dark:text-white">
            Enter your email address and we'll send you an OTP to reset your
            password.
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
                className="w-full bg-emerald-600 text-white py-6 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center"
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
          <p className="text-center text-sm text-gray-600 mt-6 dark:text-white">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
