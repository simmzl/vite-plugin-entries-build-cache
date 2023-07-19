import chalk from "chalk"

class Log {
  private static instance: Log | null = null

  constructor(private name: string = "LOG", private debugOn?: boolean) {}

  static getInstance(name?: string, debugOn?: boolean): Log {
    if (!Log.instance) Log.instance = new Log(name, debugOn)
    return Log.instance
  }

  info(msg: string) {
    console.log(chalk.blue(`[${this.name}]: ${msg}`))
  }

  warn(msg: string) {
    console.log(chalk.yellow(`[${this.name}]: ${msg}`))
  }

  error(msg: string) {
    console.log(chalk.red(`[${this.name}]: ${msg}`))
  }

  success(msg: string) {
    console.log(chalk.green(`[${this.name}]: ${msg}`))
  }

  debug(...args: unknown[]) {
    if (this.debugOn) console.log(chalk.gray(`[${this.name}] Debug: `), ...args)
  }

  throwErr(msg: string) {
    throw new Error(`[${this.name}]: ${msg}`)
  }

  time(label: string) {
    console.time(`[${this.name}] ${label}`)
  }

  timeEnd(label: string) {
    console.timeEnd(`[${this.name}] ${label}`)
  }
}

export default Log