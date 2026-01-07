import { useAuthStore } from '@/stores/auth'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import { CustomBreadcrumb } from '@/components/CustomBreadcrumb'
import { createUserQueryOptions } from '@/lib/queryOptions'
import { DesktopMenu } from '@/components/header-menus/DesktopMenu'
import { MobileMenu } from '@/components/header-menus/MobileMenu'

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
  const location = useLocation()
  // const { userInfo } = useAuthStore()

  // usePushNotifications(userInfo.id)

  const userQuery = useQuery(createUserQueryOptions())

  const userName = userQuery.data?.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || ""

  return <div>
    <header className='bg-muted flex justify-between items-center py-4 main-padding fixed w-full z-50'>
      <h1 className='text-lg font-bold'>
        <Link to='/'>
          <GraduationCap className='inline mr-2' />
          <span className='inline'>UniFlow</span>
        </Link>
      </h1>

      {/* Right Side */}
      <DesktopMenu userName={userName} />
      <MobileMenu userName={userName} />

    </header>
    <main className='main-padding pt-20 sm:pt-24 pb-10'>
      <div className='mb-4 sm:mb-6'>
        <CustomBreadcrumb location={location} showHome={true} />
      </div>
      <Outlet />
    </main>
  </div >
}