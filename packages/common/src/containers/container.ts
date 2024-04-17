export class Container {
  private instances: { [key: string]: any } = {}

  public register(key: string, instance: any): void {
    this.instances[key] = instance
  }

  public resolve<T>(key: string): T {
    const res = this.instances[key]
    if (!res) {
      throw new Error(`Could not resolve ${key}`)
    }

    return res
  }
}
