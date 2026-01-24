import Header from "@/components/Header"
import { Brain, Bell, Sparkles, BookOpen, Lightbulb, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

const Learn = () => {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNotify = () => {
    if (!email) {
      toast.error("Please enter your email")
      return
    }
    setIsSubscribed(true)
    toast.success("You'll be notified when Learn is ready!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/25 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Brain className="w-16 h-16 text-white" />
            </div>
            <div className="absolute top-0 left-1/4 w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center animate-pulse">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nutrition Academy
            <span className="text-indigo-500"> Coming Soon</span>
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
            Discover bite-sized nutrition tips and health insights to help you make 
            smarter food choices. Learn, grow, and earn points along the way!
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              Get Notified When We Launch
            </h3>
            
            {!isSubscribed ? (
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button 
                  onClick={handleNotify}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 rounded-xl"
                >
                  Notify Me
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                <Sparkles className="w-5 h-5" />
                You're on the list! We'll notify you soon.
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: BookOpen, label: "Quick Tips", desc: "Bite-sized knowledge" },
              { icon: Lightbulb, label: "Health Insights", desc: "Stay informed" },
              { icon: Star, label: "Earn Points", desc: "Learn & grow" },
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <feature.icon className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{feature.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Learn