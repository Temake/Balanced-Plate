import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";



export default function Main(){
    return(
       <>
       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex px-4">

       <Header/>
       <HeroSection/>
       </div>
       </>
    )
}