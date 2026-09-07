"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
// import GoogleButton from "@/components/GoogleButton";
import { LogIn,  AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DEMO_ACCESS_TOKEN_KEY, useRedeemDemoAccessInvite } from "@/hooks/useBilling";


const LoginformSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

type LoginFormValues = z.infer<typeof LoginformSchema>;

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const redeemDemoAccess = useRedeemDemoAccessInvite();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginformSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

 

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    setIsSubmitting(true);
    setSuccessMessage("");
   
    try {
      await login({ email: data.email, password: data.password });
      const demoToken = localStorage.getItem(DEMO_ACCESS_TOKEN_KEY);
      if (demoToken) {
        try {
          await redeemDemoAccess.mutateAsync(demoToken);
        } catch {
          localStorage.removeItem(DEMO_ACCESS_TOKEN_KEY);
        }
      }
      setSuccessMessage("Logged in successfully.");
      form.reset();
      navigate('/dashboard');
    } catch (err) {
      console.error("Error during login:", err);
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("email not verified")) {
        navigate("/verify-account", { state: { email: data.email } });
      }
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

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Sign in to continue your healthy journey
          </p>

          {/* <GoogleButton /> */}
{/* 
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                or continue with email
              </span>
            </div>
          </div> */}

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-row justify-end items-end-safe mt-0.5 my-2 text-sm text-gray-600 ">
                <a href="/forget-password" className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors">Forgot your password?</a>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600 dark:text-white mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors">
              Sign up for free
            </a>
          </p>
        
        </div>


 
      </div>
    </div>
  );
}
