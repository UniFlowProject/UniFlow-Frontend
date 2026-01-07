import { ThemeSwitch } from '@/components/ThemeSwitch'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/auth'
import { createUserQueryOptions } from '@/lib/queryOptions'

interface Props {
  userName: string;
}

export const DesktopMenu = ({ userName }: Props) => {

  const navigate = useNavigate();

  const { logout } = useAuth();

  const userQuery = useQuery(createUserQueryOptions());

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth/login' })
  }

  return <div className='hidden md:flex items-center gap-4'>
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
}