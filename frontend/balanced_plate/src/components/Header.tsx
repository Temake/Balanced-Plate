import { useAuth } from '@/hooks/useAuth'
import { Home, Camera, CalendarDays, User, User2Icon, LogOut, Leaf, ChefHat } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

/** Tailwind class for bottom padding to offset the mobile bottom nav */
export const BOTTOM_NAV_HEIGHT = 'pb-20'

const navItems = [
  { name: 'Home', icon: Home, path: '/dashboard' },
  { name: 'Scan Food', mobileLabel: 'Scan', icon: Camera, path: '/analyze-food' },
  { name: 'Meal Plan', mobileLabel: 'Plan', icon: CalendarDays, path: '/meal-plan' },
  // Explore is paused for now.
  // { name: 'Explore', icon: BookOpen, path: '/learn' },
  { name: 'Profile', icon: User, path: '/profile' },
]

const mobileNavItems = [
  { name: 'Home', icon: Home, path: '/dashboard' },
  { name: 'Scan', icon: Camera, path: '/analyze-food' },
  { name: 'Meal Plan', mobileLabel: 'Plan', icon: CalendarDays, path: '/meal-plan' },
  { name: 'Cook', icon: ChefHat, path: '/recipes', activePaths: ['/recipes', '/cook'] },
  // Explore is paused for now.
  // { name: 'Explore', icon: BookOpen, path: '/learn' },
]

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActivePath = (path: string) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* ─── Top Header (all screens) ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg">
              Balanced<span className="text-emerald-600 dark:text-emerald-400"> Plate</span>
            </span>
          </Link>

          {/* Desktop Navigation (centered) */}
          {isAuthenticated && (
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActivePath(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 lg:px-4',
                      active
                        ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ModeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/abstract-profile.png" alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-semibold">
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
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300">Log in</Link>
                </Button>
                <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Bottom Tab Navigation (Mobile only, authenticated only) ─── */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              const active = item.activePaths
                ? item.activePaths.some((path) => location.pathname.startsWith(path))
                : isActivePath(item.path)
              const label = item.mobileLabel || item.name
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors duration-200',
                    active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  <div className="relative">
                    <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
                    {active && (
                      <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium leading-tight',
                    active ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}

export default Header
