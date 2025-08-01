import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>
export default function LoginPage() {
  // const { login }= useAuth()
  const [isSubmitting,setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues:{
      email:"",
      password:""
    }
  });

  const onSubmit = async (data:LoginFormValues) => {
    console.log(data)
    // setIsSubmitting(true)
    // await login(data.email,data.password)
    //  setIsSubmitting(false)

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
          Welcome Back
        </h2>

      
        <button
          onClick={() => console.log("Google Sign-In")}
          className="w-full mb-4 py-2 px-4 flex items-center justify-center border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          Sign in with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              or sign in with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className={`mt-1 block w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className={`mt-1 block w-full px-4 py-2 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-green-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            "Signing in..."
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </>
          )}
        </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="#" className="text-black-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
