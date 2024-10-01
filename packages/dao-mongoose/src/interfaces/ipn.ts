import { IpnData, IpnResult } from '@repo/dao/dist/src/interfaces/ipn'

export interface Ipn {
  data: IpnData
  result: IpnResult | null
}

export interface IpnWithId extends Ipn {
  _id: string
}
