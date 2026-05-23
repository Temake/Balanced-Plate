import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";



export default function Main(){
    return(
       <>
       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex px-4">

       <Header/>
       <HeroSection/>
       </div>
       </>
    )
}