import { ThemeSwitch } from '@/components/ThemeSwitch'
import { Button } from '@/components/ui/button'
import { academicApi } from '@/lib/api/client'
import { useAuthStore } from '@/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { GraduationCap, LogOut, Menu } from 'lucide-react'
import { CustomBreadcrumb } from '@/components/CustomBreadcrumb'
import { NotificationPopover } from '@/components/notifications/NotificationPopOver'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { usePushNotifications } from '@/hooks/notifications/usePushNotifications'

export const Route = createFileRoute('/dashboard/_protected')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {

  const navigate = Route.useNavigate()
  const location = useLocation()
  const { logout, userInfo } = useAuthStore()


  usePushNotifications(userInfo.id)

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth/login' })
  }

  const userQuery = useQuery({
    queryKey: ['students'],
    queryFn: async () => await academicApi.get('/students/me').then(res => res.data),
    retry: false
  })

  const userName = userQuery.data?.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || ""

  return <div>
    <header className='bg-muted flex justify-between items-center py-4 main-padding fixed w-full z-50'>
      <div>
        <h1 className='text-lg font-bold'>
          <Link to='/'>
            <GraduationCap className='inline mr-2' />
            <span className='inline'>UniFlow</span>
          </Link>
        </h1>
      </div>

      {/* Desktop Layout - hidden on mobile */}
      <div className='hidden md:flex items-center gap-4'>
        {/* <NotificationPopover /> */}
        <ThemeSwitch />
        {
          userQuery.isLoading && <div className='flex items-center gap-2'>
            <Skeleton className='rounded-lg w-8 aspect-square' />
            <Skeleton className='rounded-lg h-5 w-36' />
          </div>
        }
        {
          !userQuery.isLoading && <div className='flex items-center gap-2'>
            <Avatar className='rounded-lg'>
              <AvatarImage src={userQuery.data?.avatar} />
              <AvatarFallback className='border-2 rounded-lg aspect-square p-2'>{userName}</AvatarFallback>
            </Avatar>
            <span className='hidden md:inline'>{userQuery.data?.name.split(" ").slice(0, 2).join(" ")}</span>
          </div>
        }
        <Button variant="destructive" onClick={handleLogout} className='cursor-pointer' size="icon">
          <LogOut />
        </Button>
      </div>

      {/* Mobile Layout - dropdown menu */}
      <div className='md:hidden flex items-center gap-2'>
        {/* <span className='mr-4'>
          <NotificationPopover />
        </span> */}
        {!userQuery.isLoading && (
          <Avatar className='rounded-lg h-8 w-8'>
            <AvatarImage src={userQuery.data?.avatar} />
            <AvatarFallback className='text-sm'>{userName}</AvatarFallback>
          </Avatar>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className='cursor-pointer'>
              <Menu className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {!userQuery.isLoading && (
              <>
                <DropdownMenuItem disabled className="flex items-center gap-2 font-medium opacity-100!">
                  <Avatar className='rounded-lg h-6 w-6'>
                    <AvatarImage src={userQuery.data?.avatar} />
                    <AvatarFallback className='text-xs'>{userName}</AvatarFallback>
                  </Avatar>
                  {userQuery.data?.name.split(" ").slice(0, 2).join(" ")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem className="flex items-center gap-2" asChild>
              <ThemeSwitch label='Tema' className='w-full' />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 bg-destructive text-destructive-foreground focus:text-destructive cursor-pointer"
            >
              <LogOut className='h-4 w-4 text-inherit' />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
    <main className='main-padding pt-20 sm:pt-24 pb-10'>
      <div className='mb-4 sm:mb-6'>
        <CustomBreadcrumb location={location} showHome={false} />
      </div>
      <Outlet />
    </main>
  </div >
}
