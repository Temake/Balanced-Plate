import { useAuth } from '@/hooks/useAuth'
import { Home } from 'lucide-react'


const HeadersOptions =[
  {name: "Dashboard",icon: <Home className=''/>,path:"/"},
  {name: "Dashboard",icon:"",path:"/"},
  {name: "Dashboard",icon:"",path:"/"},
  {name: "Dashboard",icon:"",path:"/"}
]


const Header = () => {
    const {isAuthenticated}= useAuth()

  return (
   <>
   
   
   </>
  )
}

export default Header