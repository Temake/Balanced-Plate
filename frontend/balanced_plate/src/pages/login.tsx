import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  // const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log(data);
    setIsSubmitting(true);
    // Simulate login process
    setTimeout(() => {
      setIsSubmitting(false);
      // await login(data.email, data.password)
    }, 1500);
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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Welcome Back</h2>
          
          {/* Google Login Button */}
  <GoogleButton/>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-green-600 hover:text-green-500 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-green-600 hover:text-green-500 font-medium transition-colors">
              Sign up for free
            </a>
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">Join thousands who are already eating smarter</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <span className="text-green-600">📸</span>
              <span>Photo Analysis</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600">🧠</span>
              <span>AI Recommendations</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600">📊</span>
              <span>Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;