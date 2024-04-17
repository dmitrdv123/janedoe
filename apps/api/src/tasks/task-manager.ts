export interface Task {
  run(): void | Promise<void>
  getInterval(): number
}

export interface TaskManager {
  run(): void
}

export class TaskManagerImpl implements TaskManager {
  private tasks: Task[] = []

  constructor(...tasks: Task[]) {
    this.tasks = tasks
  }

  public run(): void {
    this.tasks.map(
      async task => {
        await task.run()

        setInterval(async () => {
          await task.run()
        }, task.getInterval() * 1000)
      }
    )
  }
}
