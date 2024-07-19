import { Chain, arbitrum, avalanche, base, bsc, cronos, hardhat, linea, mainnet, optimism, polygon, zkSync } from 'viem/chains'
import { Permission } from './types/account-settings'
import { PaymentHistoryDataFilter } from './types/payment-history'

export const AUTH_DATA_KEY = 'janedoe:authData'
export const DEFAULT_CURRENCY_DECIMAL_PLACES = 4

export const INFO_MESSAGE_SETTINGS_ERROR = 'settings_load_error'
export const INFO_MESSAGE_UNAUTH_ERROR = 'unauth_error'
export const INFO_MESSAGE_BLOCKCHAIN_MODAL_ERROR = 'blockchain_modal_error'
export const INFO_MESSAGE_META_ERROR = 'meta_load_error'
export const INFO_MESSAGE_ACCOUNT_SETTINGS_ERROR = 'account_settings_load_error'
export const INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR = 'account_payment_settings_load_error'
export const INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_SAVING_ERROR = 'account_payment_settings_saving_error'
export const INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_ERROR = 'account_common_settings_load_error'
export const INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_SAVING_ERROR = 'account_common_settings_saving_error'
export const INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_ERROR = 'account_notification_settings_load_error'
export const INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_SAVING_ERROR = 'account_notification_settings_saving_error'
export const INFO_MESSAGE_ACCOUNT_API_SETTINGS_ERROR = 'account_api_settings_load_error'
export const INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_ERROR = 'account_team_settings_load_error'
export const INFO_MESSAGE_ACCOUNT_API_SETTINGS_SAVING_ERROR = 'account_api_settings_saving_error'
export const INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_SAVING_ERROR = 'account_team_settings_saving_error'
export const INFO_MESSAGE_AUTH_ERROR = 'auth_error'
export const INFO_MESSAGE_PAYMENT_HISTORY_ERROR = 'payment_history_error'
export const INFO_MESSAGE_PAYMENT_HISTORY_IPN_ERROR = 'payment_history_ipn_error'
export const INFO_MESSAGE_PAYMENT_HISTORY_LOAD_IPN_ERROR = 'payment_history_load_ipn_error'
export const INFO_MESSAGE_PAYMENT_HISTORY_SEND_IPN_ERROR = 'payment_history_send_ipn_error'
export const INFO_MESSAGE_PAYMENT_HISTORY_PAST_TOKEN_ERROR = 'payment_history_past_token_error'
export const INFO_MESSAGE_BALANCE_ERROR = 'balance_error'
export const INFO_MESSAGE_BALANCE_WITHDRAW_ERROR = 'balance_withdraw_error'
export const INFO_MESSAGE_EXCHANGE_RATE_ERROR = 'exchange_rate_load_error'
export const INFO_MESSAGE_SHARED_ACCOUNT_LOAD_ERROR = 'shared_account_load_error'
export const INFO_MESSAGE_SUPPORT_SUBMIT_ERROR = 'support_submit_error'

export const CURRENCY_USD_SYMBOL = 'usd'
export const BLOCKCHAIN_BTC = 'btc'
export const PAGE_SIZE = 20
export const ACCOUNT_ID_LENGTH = 11
export const PAYMENT_HISTORY_PAGE_SIZE = 25
export const COMMON_SETTINGS_MAX_DESCRIPTION_LENGTH = 250

export const PERMISSION_KEYS = ['balances', 'payments', 'common_settings', 'notification_settings', 'api_settings', 'team_settings', 'payment_settings']
export const DEFAULT_PERMISSIONS = Object.fromEntries(PERMISSION_KEYS.map(key => [key, 'View' as Permission]))
export const PERMISSION_PRIORITY = { 'Disable': 0, 'View': 1, 'Modify': 2 }
export const SUPPORTED_LANGUAGES = ['en', 'ru']

export const CHAINS: [Chain, ...Chain[]] = import.meta.env.VITE_APP_IS_DEV
  ? [
    hardhat, arbitrum, avalanche, base, bsc, cronos, linea, mainnet, optimism, polygon, zkSync
  ]
  : [
    arbitrum, avalanche, base, bsc, cronos, linea, mainnet, optimism, polygon, zkSync
  ]

export const PUBLIC_NODE_RPCS: { [key: string]: string } = {
  "56": "https://bsc-rpc.publicnode.com",
  "137": "https://polygon-bor-rpc.publicnode.com",
  "42161": "https://arbitrum-one-rpc.publicnode.com",
  "10": "https://optimism-rpc.publicnode.com",
  "8453": "https://base-rpc.publicnode.com",
  "43114": "https://avalanche-c-chain-rpc.publicnode.com",
  "25": "https://cronos-evm-rpc.publicnode.com",
  "1": "https://ethereum-rpc.publicnode.com"
}

export const EMPTY_PAYMENT_HISTORY_DATA_FILTER: PaymentHistoryDataFilter = {
  paymentId: '',
  timestampFrom: '',
  timestampTo: '',
  from: '',
  to: '',
  blockchains: [],
  transactionHash: ''
}
