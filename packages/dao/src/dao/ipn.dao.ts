import { IpnData, IpnKey, IpnResult } from '../interfaces/ipn'

export interface IpnDao {
  loadIpnData(ipnKey: IpnKey): Promise<IpnData | undefined>
  saveIpnData(ipn: IpnData): Promise<void>
}
