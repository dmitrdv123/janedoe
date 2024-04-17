export interface SharedAccountProfileKey {
  sharedAccountId: string,
  shareToAddress: string
}

export interface SharedAccountProfileResponse {
  accounts: SharedAccountProfileKey[]
}
