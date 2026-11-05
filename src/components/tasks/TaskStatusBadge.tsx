import { TaskStatus } from "@/domain/tasks"
import { Badge } from "../ui/badge"

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return 'bg-red-600/50 text-foreground'
    case TaskStatus.IN_PROGRESS:
      return 'bg-yellow-600/50'
    case TaskStatus.IN_REVIEW:
      return 'bg-orange-600/50'
    case TaskStatus.DONE:
      return 'bg-green-600/50'
    default:
      return 'bg-gray-600/50'
  }
}

interface Props {
  status: TaskStatus
}

export const TaskStatusBadge = ({ status }: Props) => {
  const statusColor = getStatusColor(status)

  return <Badge className={statusColor} variant="default">
    {status.replace('_', ' ').toUpperCase()}
  </Badge>
}
