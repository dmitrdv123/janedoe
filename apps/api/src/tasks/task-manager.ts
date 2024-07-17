import { logger } from '../utils/logger'

export interface Task {
  run(): Promise<void>
}

export interface TaskManager {
  add(key: string, task: Task, interval: number): void
  remove(key: string): void
}

export class TaskManagerImpl implements TaskManager {
  private tasks: { [key: string]: { task: Task, running: boolean, timerId: NodeJS.Timeout } } = {}

  constructor() {
  }

  public add(key: string, task: Task, interval: number): void {
    if (this.tasks[key]) {
      return
    }

    logger.info(`TaskManager: add and run task ${key} with interval ${interval} seconds`)
    task.run().then(() => {
      this.tasks[key] = {
        task,
        running: false,
        timerId: setInterval(async () => {
          if (this.tasks[key]?.running) {
            return
          }

          this.tasks[key].running = true
          try {
            await task.run()
          } finally {
            if (this.tasks[key]?.running) {
              this.tasks[key].running = false
            }
          }
        }, interval * 1000)
      }
    })
  }

  public remove(key: string): void {
    const data = this.tasks[key]
    if (!data) {
      return
    }

    clearInterval(data.timerId)
    delete this.tasks[key]
  }
}
