"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
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
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, UserPlus } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";

const SignupformSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  dateOfBirth: z.date({ message : "Please select a date of birth" }),
});

type SignUpFormValues = z.infer<typeof SignupformSchema>

export default function SignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false);


  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignupformSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      dateOfBirth: undefined,
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement your signup logic here
      console.log(data);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    } catch (error) {
      console.error("Error during signup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg relative overflow-hidden">
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
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M16 6 L24 12 L20 16 L16 16 Z" fill="currentColor" opacity="0.7"/>
                <path d="M24 12 L26 20 L20 16 Z" fill="currentColor" opacity="0.5"/>
                <path d="M26 20 L16 26 L20 16 Z" fill="currentColor" opacity="0.6"/>
                <path d="M16 26 L8 20 L16 16 L20 16 Z" fill="currentColor" opacity="0.7"/>
                <path d="M8 20 L6 12 L16 16 Z" fill="currentColor" opacity="0.5"/>
                <path d="M6 12 L16 6 L16 16 Z" fill="currentColor" opacity="0.6"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
                <circle cx="14" cy="14" r="0.5" fill="currentColor"/>
                <circle cx="18" cy="14" r="0.5" fill="currentColor"/>
                <circle cx="16" cy="18" r="0.5" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Balanced Plate<span className="text-green-600 dark:text-green-500">.AI</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Your AI-powered nutrition companion</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Create Account</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Get started with your healthy journey today
          </p>

          {/* Google Signup Button */}
          <GoogleButton />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                or continue with email
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
                        placeholder="John Doe"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                      />
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
                    <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 dark:bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 font-medium transition-colors">
              Sign in instead
            </a>
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Join thousands who are already eating smarter</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-1">
              <span className="text-green-600 dark:text-green-500">📸</span>
              <span>Photo Analysis</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600 dark:text-green-500">🧠</span>
              <span>AI Recommendations</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600 dark:text-green-500">📊</span>
              <span>Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

