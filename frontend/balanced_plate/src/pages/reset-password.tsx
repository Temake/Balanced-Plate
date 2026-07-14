
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

import { useNavigate,useLocation } from "react-router-dom";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword, error } = useAuth();
  const [email, setEmail] = useState("");
  const [hasEmailState, setHasEmailState] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  useEffect(() => {
    const state = location.state as { email?: string } | null;
    const hiddenEmail = state?.email?.trim();

    if (!hiddenEmail) {
      navigate("/forget-password", { replace: true });
      return;
    }

    setEmail(hiddenEmail);
    setHasEmailState(true);
  }, [location.state, navigate]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage("");
    try {
      await resetPassword(email, data.password, data.confirmPassword);
      setSuccessMessage("Password Changed Successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error resetting password:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasEmailState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" className="mx-auto w-20 h-20 rounded-2xl object-contain mb-4" alt="NutriLens Logo" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            NutriLens
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Your Nigerian food accountability companion</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Reset Password</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Please enter your new password
          </p>

          <Form {...form}>
            {successMessage && (
              <div className="p-3 rounded bg-green-50 text-green-700 text-sm mb-2">{successMessage}</div>
            )}
            {error && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-sm mb-2">{error}</div>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                    {/* <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <li className={field.value?.length >= 8 ? "text-green-500" : ""}>
                        • At least 8 characters long
                      </li>
                      <li className={/[A-Z]/.test(field.value || "") ? "text-green-500" : ""}>
                        • Contains an uppercase letter
                      </li>
                      <li className={/[a-z]/.test(field.value || "") ? "text-green-500" : ""}>
                        • Contains a lowercase letter
                      </li>
                      <li className={/[0-9]/.test(field.value || "") ? "text-green-500" : ""}>
                        • Contains a number
                      </li>
                    </ul> */}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center mt-6"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Back to Login Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Remember your password?{" "}
            <a href="/login" className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors">
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
