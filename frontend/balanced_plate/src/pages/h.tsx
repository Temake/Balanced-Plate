// "use client";

// import { useState, type FormEvent } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { cn } from "@/lib/utils";
// import {
//   PhoneInput
// } from "@/components/ui/phone-input";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormDescription,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { format } from "date-fns";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { Calendar as CalendarIcon, UserPlus } from "lucide-react";
// import GoogleButton from "@/components/GoogleButton";
// import { useAuth } from "@/hooks/useAuth";

// const SignupformSchema = z.object({
//   first_name: z.string().min(1, { message: "First name is required" }),
//   last_name: z.string().min(1, { message: "Last name is required" }),
//   email: z.string().email({ message: "Please enter a valid email" }),
//   phone_number: z.string().min(10, { message: "Phone number is required" }),
//   password: z.string().min(8, { message: "Password must be at least 8 characters" }),
//   password2: z.string().min(8, { message: "Please confirm your password" }),
//   dob: z.string().min(5, { message: "Please select a date of birth" }),
//   gender: z.enum(["MALE", "FEMALE", "OTHER"], { message : "Please select a gender" }),
//   country: z.string().optional(),
//   state: z.string().optional(),
//   city: z.string().optional(),
// }).refine((data) => data.password === data.password2, {
//   message: "Passwords must match",
//   path: ["password2"],
// });

// type SignUpFormValues = z.infer<typeof SignupformSchema>

// export default function SignUp() {
//   const { SignUp, clearError, error } = useAuth();
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const genderOptions = [
//     { value: "MALE", label: "Male" },
//     { value: "FEMALE", label: "Female" },
//     { value: "OTHER", label: "Other" },
//   ];

//   const form = useForm<SignUpFormValues>({
//     resolver: zodResolver(SignupformSchema),
//     defaultValues: {
//       first_name: "",
//       last_name: "",
//       email: "",
//       phone_number: "",
//       password: "",
//       password2: "",
//       dob: "",
//       gender: "OTHER",
//       country: "",
//       state: "",
//       city: "",
//     },
//   });

//   const onSubmit = async (data: SignUpFormValues) => {
//     setIsSubmitting(true);
//     setSuccessMessage("");
//     clearError();
//     try {
//       await SignUp({
//         dob: data.dob,
//         email: data.email,
//         first_name: data.first_name,
//         last_name: data.last_name,
//         password: data.password,
//         password2: data.password2,
//         phone_number: data.phone_number,
//         gender: data.gender,
//         country: data.country || undefined,
//         state: data.state || undefined,
//         city: data.city || undefined,
//       });
//       setSuccessMessage("Sign up successful! Please verify your email.");
//       form.reset();
//     } catch (err) {
//       console.error("Error during signup:", err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
//       <div className="max-w-md w-full">
//         {/* Logo and Header */}
//         <div className="text-center mb-8">
//           <div className="mx-auto w-20 h-20 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
//             <UserPlus className="w-8 h-8 text-white" />
//           </div>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//             Balanced Plate<span className="text-green-600 dark:text-green-500">.AI</span>
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">Your AI-powered nutrition companion</p>
//         </div>

//         {/* Signup Card */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
//           <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Create Account</h2>
//           <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
//             Get started with your healthy journey today
//           </p>

//           {/* Google Signup Button */}
//           <GoogleButton />

//           {/* Divider */}
//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
//                 or continue with email
//               </span>
//             </div>
//           </div>

//           {/* Signup Form */}
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <div className="flex gap-4">
//               <FormField
//                 control={form.control}
//                 name="firstName"
//                 render={({ field }) => (
//                 <FormItem className="flex-1">
//                   <FormLabel className="text-gray-700 dark:text-gray-300">First Name</FormLabel>
//                   <FormControl>
//                   <Input
//                     {...field}
//                     className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
//                     placeholder="John"
//                     disabled={isSubmitting}
//                   />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="lastName"
//                 render={({ field }) => (
//                 <FormItem className="flex-1">
//                   <FormLabel className="text-gray-700 dark:text-gray-300">Last Name</FormLabel>
//                   <FormControl>
//                   <Input
//                     {...field}
//                     className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
//                     placeholder="Doe"
//                     disabled={isSubmitting}
//                   />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//                 )}
//               />
//               </div>

//               <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                 <FormLabel className="text-gray-700 dark:text-gray-300">Email Address</FormLabel>
//                 <FormControl>
//                   <Input
//                   {...field}
//                   type="email"
//                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
//                   placeholder="you@example.com"
//                   disabled={isSubmitting}
//                   />
//                 </FormControl>
//                 <FormMessage />
//                 </FormItem>
//               )}
//               />

//               <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                 <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
//                 <FormControl>
//                   <Input
//                   {...field}
//                   type="password"
//                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
//                   placeholder="••••••••"
//                   disabled={isSubmitting}
//                   />
//                 </FormControl>
//                 <FormMessage />
//                 </FormItem>
//                 )}
//                 />
//                 <FormField
//                 control={form.control}
//                 name="phone"
//                 render={({ field }) => (
//                 <FormItem>
//                 <FormLabel className="text-gray-700 dark:text-gray-300">Phone Number</FormLabel>
//                 <FormControl>
//                   <PhoneInput
//                   {...field}
//                   placeholder="Enter phone number"
//                   defaultCountry="NG"
//                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white dark:hover:bg-gray-600"
//                   disabled={isSubmitting}
//                   />
//                 </FormControl>
//                 <FormMessage />
//                 </FormItem>
//                 )}
//                 />

//                 <FormField
//                 control={form.control}
//                 name="dateOfBirth"
//                 render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                 <FormLabel className="text-gray-700 dark:text-gray-300">Date of Birth</FormLabel>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                   <FormControl>
//                     <Button
//                     variant={"outline"}
//                     className={cn(
//                       "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200",
//                       !field.value && "text-muted-foreground"
//                     )}
//                     disabled={isSubmitting}
//                     >
//                     {field.value ? (
//                       format(field.value, "PPP")
//                     ) : (
//                       <span>Pick a date</span>
//                     )}
//                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                     </Button>
//                   </FormControl>

//               </svg>
//               </div>
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//                 Balanced Plate<span className="text-green-600 dark:text-green-500">.AI</span>
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400">Your AI-powered nutrition companion</p>
//             </div>

//             {/* Error/Success Messages */}
//             {error && (
//               <div className="mb-4 text-red-600 bg-red-100 rounded p-2 text-center">{error}</div>
//             )}
//             {successMessage && (
//               <div className="mb-4 text-green-600 bg-green-100 rounded p-2 text-center">{successMessage}</div>
//             )}

//             {/* Signup Card */}
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
//               <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Create Account</h2>
//               <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
//                 Get started with your healthy journey today
//               </p>
//               <GoogleButton />
//               <div className="relative my-6">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
//                     or continue with email
//                   </span>
//                 </div>
//               </div>
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="first_name"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>First Name</FormLabel>
//                           <FormControl>
//                             <Input placeholder="John" {...field} disabled={isSubmitting} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="last_name"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Last Name</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Doe" {...field} disabled={isSubmitting} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="phone_number"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Phone Number</FormLabel>
//                         <FormControl>
//                           <PhoneInput placeholder="Enter phone number" defaultCountry="NG" {...field} disabled={isSubmitting} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <div className="grid grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Password</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="password2"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Confirm Password</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="dob"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col">
//                           <FormLabel>Date of Birth</FormLabel>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <FormControl>
//                                 <Button
//                                   variant={"outline"}
//                                   className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
//                                   disabled={isSubmitting}
//                                 >
//                                   {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
//                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                 </Button>
//                               </FormControl>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                               <Calendar
//                                 mode="single"
//                                 selected={field.value ? new Date(field.value) : undefined}
//                                 onSelect={(date) => field.onChange(date?.toISOString())}
//                                 disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
//                                 initialFocus
//                               />
//                             </PopoverContent>
//                           </Popover>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="gender"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Gender</FormLabel>
//                           <Select onValueChange={field.onChange} defaultValue={field.value}>
//                             <FormControl>
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Select gender" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               {genderOptions.map((option) => (
//                                 <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <div className="grid grid-cols-3 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="country"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Country</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Country" {...field} disabled={isSubmitting} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="state"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>State</FormLabel>
//                           <FormControl>
//                             <Input placeholder="State" {...field} disabled={isSubmitting} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="city"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>City</FormLabel>
//                           <FormControl>
//                             <Input placeholder="City" {...field} disabled={isSubmitting} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <Button type="submit" disabled={isSubmitting} className="w-full">
//                     {isSubmitting ? (
//                       <div className="flex items-center justify-center space-x-2">
//                         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
//                         <span>Creating account...</span>
//                       </div>
//                     ) : (
//                       <>
//                         <UserPlus className="mr-2 h-4 w-4" />
//                         Create Account
//                       </>
//                     )}
//                   </Button>
//                 </form>
//               </Form>
//               <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
//                 Already have an account?{" "}
//                 <a href="/login" className="text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 font-medium transition-colors">Sign in instead</a>
//               </p>
//             </div>
//             <div className="mt-8 text-center">
//               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Join thousands who are already eating smarter</p>
//               <div className="flex justify-center space-x-6 text-xs text-gray-400 dark:text-gray-500">
//                 <div className="flex items-center space-x-1">
//                   <span className="text-green-600 dark:text-green-500">📸</span>
//                   <span>Photo Analysis</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <span className="text-green-600 dark:text-green-500">🧠</span>
//                   <span>AI Recommendations</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <span className="text-green-600 dark:text-green-500">📊</span>
//                   <span>Progress Tracking</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

