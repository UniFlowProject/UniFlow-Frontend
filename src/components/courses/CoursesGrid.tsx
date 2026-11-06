import { useCoursesByPeriod } from "@/hooks/courses/useCoursesByPeriod";
import { Skeleton } from "../ui/skeleton";
import { CourseCard } from "./CourseCard";

interface Props {
  periodId: string;
}

export const CoursesGrid = ({ periodId }: Props) => {

  const { coursesByPeriod } = useCoursesByPeriod(periodId);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mt-4'>
      {
        coursesByPeriod.isLoading && !coursesByPeriod.data
          ? <>
            <Skeleton className='h-64 w-full rounded-xl' />
            <Skeleton className='h-64 w-full rounded-xl' />
            <Skeleton className='h-64 w-full rounded-xl' />
            <Skeleton className='h-64 w-full rounded-xl' />
          </>
          : coursesByPeriod.data?.map(course => <CourseCard key={course.id} course={course} />)
      }
    </div>
  )
}
