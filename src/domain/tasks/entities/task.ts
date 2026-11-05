import { TaskPriority } from '../enums/task-priority'
import { TaskStatus } from '../enums/task-status'

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public readonly courseId: string,
    public dueDate: Date,
    public priority: TaskPriority,
    // public type: TaskType,
    public status: TaskStatus = TaskStatus.TODO,
    public description?: string,
    public estimatedTimeHours?: number,
    // public actualTimeHours?: number,
    public tags: string[] = [],
    // public isGroupWork: boolean = false,
    // public groupMembers: string[] = [],
    // public attachments: string[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public completedAt?: Date
  ) {
    if (tags == null || tags === undefined) {
      this.tags = []
    }
    this.validateTitle(title)
    this.validateDueDate(dueDate)
    this.validateEstimatedTime(estimatedTimeHours)
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty')
    }
    if (title.length > 200) {
      throw new Error('Task title cannot exceed 200 characters')
    }
  }

  private validateDueDate(dueDate: Date): void {
    if (dueDate < new Date()) {
      console.warn('Task due date is in the past')
    }
  }

  private validateEstimatedTime(hours?: number): void {
    if (hours !== undefined && (hours < 0 || hours > 168)) {
      throw new Error('Estimated time must be between 0 and 168 hours (1 week)')
    }
  }

  // Métodos de negocio
  start(): Task {
    if (this.status === TaskStatus.DONE) {
      throw new Error('Cannot start a completed task')
    }

    return this.updateStatus(TaskStatus.IN_PROGRESS)
  }

  complete(): Task {
    // if (this.status === TaskStatus.CANCELLED) {
    //   throw new Error('Cannot complete a cancelled task')
    // }

    const newTask = this.updateStatus(TaskStatus.DONE)
    newTask.completedAt = new Date()
    return newTask
  }

  sendToReview(): Task {
    // if (this.status !== TaskStatus.IN_PROGRESS) {
    //   throw new Error('Can only send in-progress tasks to review')
    // }

    return this.updateStatus(TaskStatus.IN_REVIEW)
  }

  updateStatus(newStatus: TaskStatus): Task {
    const completedAt = newStatus === TaskStatus.DONE ? new Date() : undefined

    return new Task(
      this.id,
      this.title,
      this.courseId,
      this.dueDate,
      this.priority,
      // this.type,
      newStatus,
      this.description,
      this.estimatedTimeHours,
      // this.actualTimeHours,
      this.tags,
      // this.isGroupWork,
      // this.groupMembers,
      // this.attachments,
      this.createdAt,
      new Date(),
      completedAt
    )
  }

  updateDetails(
    title: string,
    description?: string,
    dueDate?: Date,
    priority?: TaskPriority,
    estimatedTimeHours?: number
  ): Task {
    return new Task(
      this.id,
      title,
      this.courseId,
      dueDate || this.dueDate,
      priority || this.priority,
      // this.type,
      this.status,
      description,
      estimatedTimeHours,
      // this.actualTimeHours,
      this.tags,
      // this.isGroupWork,
      // this.groupMembers,
      // this.attachments,
      this.createdAt,
      new Date(),
      this.completedAt
    )
  }

  addTag(tag: string): Task {
    if (this.tags.includes(tag)) return this

    return new Task(
      this.id,
      this.title,
      this.courseId,
      this.dueDate,
      this.priority,
      // this.type,
      this.status,
      this.description,
      this.estimatedTimeHours,
      // this.actualTimeHours,
      [...this.tags, tag],
      // this.isGroupWork,
      // this.groupMembers,
      // this.attachments,
      this.createdAt,
      new Date(),
      this.completedAt
    )
  }

  removeTag(tag: string): Task {
    return new Task(
      this.id,
      this.title,
      this.courseId,
      this.dueDate,
      this.priority,
      // this.type,
      this.status,
      this.description,
      this.estimatedTimeHours,
      // this.actualTimeHours,
      this.tags.filter(t => t !== tag),
      // this.isGroupWork,
      // this.groupMembers,
      // this.attachments,
      this.createdAt,
      new Date(),
      this.completedAt
    )
  }

  // Métodos de consulta
  isOverdue(): boolean {
    return this.dueDate < new Date() && this.status !== TaskStatus.DONE
  }

  isDueSoon(hoursThreshold: number = 24): boolean {
    const hoursUntilDue = (this.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    return hoursUntilDue <= hoursThreshold && hoursUntilDue > 0
  }

  getTimeUntilDue(): string {
    const now = new Date()
    const diff = this.dueDate.getTime() - now.getTime()

    if (diff < 0) return 'Overdue'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} day(s) left`
    if (hours > 0) return `${hours} hour(s) left`
    return 'Due soon'
  }

  getProgressPercentage(): number {
    switch (this.status) {
      case TaskStatus.TODO: return 0
      case TaskStatus.IN_PROGRESS: return 50
      case TaskStatus.IN_REVIEW: return 80
      case TaskStatus.DONE: return 100
      default: return 0
    }
  }

  // canBeEdited(): boolean {
  //   return this.status !== TaskStatus.DONE && this.status !== TaskStatus.CANCELLED
  // }

  // getTypeDisplayName(): string {
  //   switch (this.type) {
  //     case TaskType.ASSIGNMENT: return 'Assignment'
  //     case TaskType.EXAM: return 'Exam'
  //     case TaskType.READING: return 'Reading'
  //     case TaskType.PRESENTATION: return 'Presentation'
  //     case TaskType.LAB: return 'Laboratory'
  //     case TaskType.QUIZ: return 'Quiz'
  //     case TaskType.ESSAY: return 'Essay'
  //     case TaskType.GROUP_WORK: return 'Group Work'
  //     default: return 'Task'
  //   }
  // }

  // hasGroupMembers(): boolean {
  //   return this.isGroupWork && this.groupMembers.length > 0
  // }
}
