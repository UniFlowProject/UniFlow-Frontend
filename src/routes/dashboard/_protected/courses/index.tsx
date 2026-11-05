import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_protected/courses/')({
  component: RouteComponent,
  beforeLoad: () => { throw redirect({ to: '/dashboard' }) },
})

function RouteComponent() {
  return <div>Hello "/dashboard/courses/"!</div>
}
