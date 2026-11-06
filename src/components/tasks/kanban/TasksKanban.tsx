import { useTasks } from "@/hooks/tasks"
import { TaskKanbanColumn } from "./TaskKanbanColumn";
import { TaskStatus } from "@/domain/tasks";

export const TasksKanban = () => {

  const tasksQuery = useTasks();

  return (
    <div className="flex gap-4">
      <TaskKanbanColumn
        title="To Do"
        status={TaskStatus.TODO}
        tasks={tasksQuery.data?.filter(task => task.status === TaskStatus.TODO) || []}
      />
      <TaskKanbanColumn
        title="En proceso"
        status={TaskStatus.IN_PROGRESS}
        tasks={tasksQuery.data?.filter(task => task.status === TaskStatus.IN_PROGRESS) || []}
      />
      <TaskKanbanColumn
        title="En revisión"
        status={TaskStatus.IN_REVIEW}
        tasks={tasksQuery.data?.filter(task => task.status === TaskStatus.IN_REVIEW) || []}
      />
      <TaskKanbanColumn
        title="Hecho"
        status={TaskStatus.DONE}
        tasks={tasksQuery.data?.filter(task => task.status === TaskStatus.DONE) || []}
      />
      {/* {
        tasksQuery.data?.map(task => <TaskKanbanItem task={task} />)
      } */}
    </div>
  )
}
