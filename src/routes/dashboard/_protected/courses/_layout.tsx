import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/_protected/courses/_layout',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/periods/$periodId/courses/_layout"!</div>
}
