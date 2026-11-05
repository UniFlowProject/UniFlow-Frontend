import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/_protected/courses/$courseId/_layout',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/_protected/courses/$courseId/_layout"!</div>
}
