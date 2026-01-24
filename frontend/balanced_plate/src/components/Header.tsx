import { useAuth } from '@/hooks/useAuth'
import { Brain, CookingPot, Home, ShoppingCart, User2Icon, Menu, X, LogOut, Camera } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const isActivePath = (path: string) => location.pathname === path

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isSidebarOpen])

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link to="/" className="hidden sm:block">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Balanced Plate<span className="text-green-600 dark:text-green-500">.AI</span>
              </h3>
            </Link>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-8">
              <div className="flex items-center justify-between w-full">
                {HeadersOptions.map((option) => (
                  <Link
                    key={option.path}
                    to={option.path}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-[120px] justify-center rounded-full",
                      isActivePath(option.path)
                        ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                        : "text-foreground/70 hover:bg-accent/50 hover:text-foreground/80"
                    )}
                  >
                    {option.icon}
                    {option.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          <div className="flex items-center gap-3">
            <ModeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/abstract-profile.png" alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User2Icon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
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
      </header>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      />

      {/* Slide-in Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 z-50 md:hidden transform transition-transform duration-300 ease-out shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Balanced Plate<span className="text-green-600">.AI</span>
            </h3>
            <Button variant="ghost" size="icon" onClick={closeSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="p-4 border-b dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/abstract-profile.png" />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {isAuthenticated ? (
              HeadersOptions.map((option) => (
                <Link
                  key={option.path}
                  to={option.path}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActivePath(option.path)
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {option.icon}
                  {option.name}
                </Link>
              ))
            ) : (
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild onClick={closeSidebar}>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button className="w-full justify-start" asChild onClick={closeSidebar}>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          {isAuthenticated && (
            <div className="p-4 border-t dark:border-gray-800">
              <Link
                to="/profile"
                onClick={closeSidebar}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <User2Icon className="w-5 h-5" />
                Profile Settings
              </Link>
              <button
                onClick={() => { logout(); closeSidebar(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
              >
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Header