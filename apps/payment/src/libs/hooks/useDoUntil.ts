export default function useDoUntil() {
  return (interval: number, func: () => Promise<boolean>) => {
    const intervalId = setInterval(async () => {
      try {
        const res = await func()
        if (res) {
          clearInterval(intervalId)
        }
      } catch (error) {
        clearInterval(intervalId)
        throw error
      }
    }, interval)

    return () => clearInterval(intervalId)
  }
}
