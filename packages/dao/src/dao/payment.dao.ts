import { IpnKey, IpnResult } from '../interfaces/ipn'
import { PaymentHistory, PaymentHistoryFilter } from '../interfaces/payment-history'
import { PaymentLog } from '../interfaces/payment-log'
import { PaymentSuccess } from '../interfaces/payment-success'

export interface PaymentDao {
  listPaymentHistory(accountId: string, filter?: PaymentHistoryFilter): Promise<PaymentHistory[]>

  savePaymentLog(paymentLog: PaymentLog): Promise<void>
  listPaymentLogs(accountId: string, filter?: PaymentHistoryFilter): Promise<PaymentLog[]>

  savePaymentSuccess(paymentSuccess: PaymentSuccess): Promise<void>
  loadPaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number): Promise<PaymentSuccess | undefined>

  saveIpnResult(ipnKey: IpnKey, ipnResult: IpnResult): Promise<void>
  loadIpnResult(ipnKey: IpnKey): Promise<IpnResult | undefined>
}
