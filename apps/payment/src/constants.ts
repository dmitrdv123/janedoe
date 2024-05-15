import { Chain, arbitrum, avalanche, base, bsc, cronos, hardhat, linea, mainnet, optimism, polygon, zkSync } from 'viem/chains'
import { tron } from './types/chains'

export const DEFAULT_BLOCKCHAIN_ID = 1
export const DEFAULT_CURRENCY_DECIMAL_PLACES = 2
export const DEFAULT_TOKEN_DECIMAL_PLACES = 4
export const ALLOWED_DELTA = 0.005
export const MAX_QUOTE_ITERATIONS = 10
export const ACCOUNT_ID_LENGTH = 11
export const SETTINGS_UPDATE_INTERVAL_MS = 600000
export const DEBOUNCE_TIMEOUT = 500

export const INFO_MESSAGE_SETTINGS_ERROR = 'settings_load_error'
export const INFO_MESSAGE_PAYMENT_DETAILS_ERROR = 'payment_details_load_error'
export const INFO_MESSAGE_WALLET_DETAILS_ERROR = 'wallet_details_load_error'
export const INFO_MESSAGE_BLOCKCHAIN_MODAL_ERROR = 'blockchain_modal_error'
export const INFO_MESSAGE_BLOCKCHAIN_TRANSFER_WALLET_ERROR = 'blockchain_transfer_wallet_error'
export const INFO_MESSAGE_ID_ERROR = 'id_error'
export const INFO_MESSAGE_PAYMENT_ID_ERROR = 'payment_id_error'
export const INFO_MESSAGE_CURRENCY_ERROR = 'currency_error'
export const INFO_MESSAGE_AMOUNT_CURRENCY_ERROR = 'amount_currency_error'
export const INFO_MESSAGE_PAYMENT_PROCESSING_ERROR = 'payment_processing_error'
export const INFO_MESSAGE_ACCOUNT_RECEIVED_AMOUNT_ERROR = 'account_received_amount_error'
export const INFO_MESSAGE_PAYMENT_SUCCESS_ERROR = 'payment_success_error'
export const INFO_MESSAGE_PAYMENT_HISTORY_ERROR = 'payment_history_error'
export const INFO_MESSAGE_ACCOUNT_ID_ERROR = 'account_id_error'
export const INFO_MESSAGE_PAYMENT_CONVERSION_ERROR = 'payment_conversion_error'
export const INFO_MESSAGE_SUPPORT_SUBMIT_ERROR = 'support_submit_error'
export const INFO_MESSAGE_WALLET_NOT_FOUND_ERROR = 'wallet_not_found_error'
export const INFO_MESSAGE_NATIVE_TOKEN_NOT_FOUND_ERROR = 'native_token_not_found_error'
export const INFO_MESSAGE_TOKEN_PRICE_NOT_DEFINED_ERROR = 'token_price_not_defined_error'
export const INFO_MESSAGE_RECEIVED_AMOUNT_ERROR = 'received_amount_error'

export const PAGE_SIZE = 20
export const CURRENCY_USD_SYMBOL = 'usd'
export const BLOCKCHAIN_BTC = 'btc'

export const SUPPORTED_LANGUAGES = ['en', 'ru']
export const SLIPPAGES = [0.5, 1, 3, 5, 8, 13, 20]
export const DEFAULT_SLIPPAGE = 0.5

export const CHAINS: [Chain, ...Chain[]] = import.meta.env.VITE_APP_IS_DEV
  ? [
    hardhat, arbitrum, avalanche, base, bsc, cronos, linea, mainnet, optimism, polygon, tron, zkSync
  ]
  : [
    arbitrum, avalanche, base, bsc, cronos, linea, mainnet, optimism, polygon, tron, zkSync
  ]
