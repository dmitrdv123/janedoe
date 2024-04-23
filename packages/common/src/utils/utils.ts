export function isNullOrEmptyOrWhitespaces(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === ''
}
