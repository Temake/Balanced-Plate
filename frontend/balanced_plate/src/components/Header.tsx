import { useAuth } from '@/hooks/useAuth'
import { Brain, CookingPot, Home, ShoppingCart, User2Icon, Menu, X, LogOut, Camera } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {Avatar,AvatarFallback,AvatarImage} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/toggle'

import { cn } from '@/lib/utils'
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu'

const HeadersOptions = [
  { name: "Dashboard", icon: <Home className='w-5 h-5' />, path: "/" },
  { name: "Analyze Food", icon: <Camera className='w-5 h-5' />, path: "/analyze-food" },
  { name: "Recipes", icon: <CookingPot className='w-5 h-5' />, path: "/recipes" },
  { name: "Shopping", icon: <ShoppingCart className='w-5 h-5' />, path: "/shopping" },
  { name: "Learn", icon: <Brain className='w-5 h-5' />, path: "/learn" },
]

const Header:React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
   
        <div className="mr-6 flex items-center space-x-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <span className="hidden sm:inline-block">
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.7">
            Balanced Plate<span className="text-green-600 dark:text-green-500">.AI</span>
          </h3>
          </span>
        </div>

 
        {isAuthenticated && (
          <nav className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center justify-between w-full">
              {HeadersOptions.map((option) => (
                <Link
                  key={option.path}
                  to={option.path}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:text-foreground/80 whitespace-nowrap min-w-[120px] justify-center",
                    isActivePath(option.path) 
                      ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-full" 
                      : "text-foreground/70 hover:bg-accent/50 rounded-full"
                  )}
                >
                  {option.icon}
                  {option.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <div className="flex items-center space-x-3">
          <ModeToggle />
            
          {isAuthenticated ? (
    <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/abstract-profile.png" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 items-center">
                  <p className="text-sm font-medium leading-none ">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User2Icon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
           
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
          ) : (
            <div className="flex items-center space-x-2 ">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

     
      {isMobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="p-4">
            {/* Mobile Balanced Plate branding */}
            <div className="mb-4 pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Balanced Plate<span className="text-green-600 dark:text-green-500">.AI</span>
              </h3>
            </div>
            
            
            {isAuthenticated && (
              <nav className="grid gap-2">
                {HeadersOptions.map((option) => (
                  <Link
                    key={option.path}
                    to={option.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActivePath(option.path)
                        ? "bg-green-600 dark:bg-green-500 text-white rounded-full"
                        : "text-foreground/60"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {option.icon}
                    {option.name}
                  </Link>
                ))}
              </nav>
            )}
            
            {/* Auth buttons for non-authenticated users */}
            {!isAuthenticated && (
              <div className="grid gap-2">
                <Button variant="ghost" className="justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button className="justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header