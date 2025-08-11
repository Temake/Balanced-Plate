import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Otp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-green-600 mb-4 sm:mb-6">
          Enter Your OTP
        </h2>
        <p className="text-sm sm:text-base text-center text-gray-600 mb-4 sm:mb-6">
          Please enter the OTP sent to your registered email.
        </p>
        <div className="flex justify-center">
          <InputOTP maxLength={6} className="gap-2 sm:gap-4">
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
      </div>
    </div>
  )
}

export default Otp