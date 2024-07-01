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

        let isRunning = false
        setInterval(async () => {
          if (!isRunning) {
            isRunning = true
            try {
              await task.run()
            } finally {
              isRunning = false
            }
        }
        }, task.getInterval() * 1000)
      }
    )
  }
}
