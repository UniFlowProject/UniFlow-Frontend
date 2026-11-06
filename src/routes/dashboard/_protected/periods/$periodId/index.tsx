import { GoBackButton } from '@/components/GoBackButton';
import { PeriodSelector } from '@/components/periods/PeriodSelector';
import { PeriodStats } from '@/components/periods/PeriodStats';
import SectionTitle from '@/components/SectionTitle'
import { CoursesGrid } from '@/components/courses/CoursesGrid';
import { TaskKanbanBoard } from '@/components/tasks/kanban/TaskKanbanBoard';
import { TasksTable } from '@/components/tasks/TasksTable2';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasksByPeriod } from '@/hooks/tasks/useTasksByPeriod';
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react';
import z from 'zod';

export const Route = createFileRoute('/dashboard/_protected/periods/$periodId/')({
  component: RouteComponent,
  validateSearch: (search) => z.object({
    tab: z.enum(["table", "kanban"]).optional()
  }).parse(search)
})

function RouteComponent() {
  const { periodId } = Route.useParams();
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const { tasksQuery } = useTasksByPeriod(periodId);


  const handleTabChange = (tabValue: string) => {
    navigate({
      search: { tab: tabValue as "table" | "kanban" },
      replace: true
    })
  }

  return <div>
    <div className='flex items-center gap-4'>
      <GoBackButton />
      <PeriodSelector periodId={periodId} />
    </div>

    <PeriodStats periodId={periodId} />

    <div className="mt-8">
      <div className='flex flex-row justify-between items-center mb-4'>
        <SectionTitle>Cursos</SectionTitle>
        <Button className='cursor-pointer' size="sm" color="primary" asChild>
          <Link to='/dashboard/courses/create' className='flex items-center justify-center gap-2'>
            <span className='inline'>Añadir Curso</span>
            <Plus className='h-4 w-4' />
          </Link>
        </Button>
      </div>
      <CoursesGrid periodId={periodId} />
    </div>

    <Tabs value={searchParams.tab || "table"} onValueChange={handleTabChange} className="w-full mt-8">
      <div className='flex justify-between items-center w-full mb-6'>
        <SectionTitle>Entregas del Semestre</SectionTitle>
        <TabsList className='hidden md:inline'>
          <TabsTrigger value="table">Tabla</TabsTrigger>
          <TabsTrigger value="kanban" >Kanban</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="table">
        <TasksTable tasks={tasksQuery.data} isLoading={tasksQuery.isLoading} error={tasksQuery.error} />
      </TabsContent>
      <TabsContent value="kanban">
        <TaskKanbanBoard />
      </TabsContent>
    </Tabs>
  </div>
}