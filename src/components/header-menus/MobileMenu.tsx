import { ThemeSwitch } from '@/components/ThemeSwitch'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { LogOut, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/auth'
import { createUserQueryOptions } from '@/lib/queryOptions'

interface Props {
  userName: string;
}

export const MobileMenu = ({ userName }: Props) => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const userQuery = useQuery(createUserQueryOptions());

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth/login' })
  }

  return <div className='md:hidden flex items-center gap-2'>
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
}