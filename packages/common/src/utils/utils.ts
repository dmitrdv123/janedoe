import { ACCOUNT_ID_LENGTH } from '../constants'

export function isNullOrEmptyOrWhitespaces(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === ''
}

export function createProtocolPaymentId(accountId: string, paymentId: string): string {
  return `${accountId}${paymentId}`
}

export function getPaymentIdFromProtocolPaymentId(protocolPaymentId: string): string {
  return protocolPaymentId.substring(ACCOUNT_ID_LENGTH)
}
