import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const Api: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_api_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            Using the API you can:
          </p>
          <ul>
            <li>
              get information about payments,
            </li>
            <li>
              get information about supported blockchains,
            </li>
            <li>
              get information about supported tokens,
            </li>
          </ul>

          <p>
            In order to use the API, you need to generate an <code>API Key</code> on the page <a href={`${config.config?.baseUrlAccount}/account_settings`} target="_blank">Account Settings</ a> in the <code>API Settings</code> section.
          </p>
          <p>
            <Image src='../locales/en/img/api_settings_1.png' fluid />
          </p>

          <h4>
            API method - payments
            </h4>
          <p>
            Data is updated once every 10 seconds. There is no point in asking for them more often.
          </p>
          <p>
            Request format:
          </p>
          <ul>
            <li>
              Endpoint - {config.config?.baseUrlApi}/api/v1/payments?from=&to=. Optionally, you can specify <code>from</code> and <code>to</code> in unix epoch in seconds to filter payments by time. Interval boundaries included in the results.
            </li>
            <li>
              HTTP Method - GET
            </li>
            <li>
              Headers:
              <ul>
                <li>
                  x-api-key: <code>Ключ API</code>
                </li>
              </ul>
            </li>
          </ul>
          <p>
            Result:
          </p>
          <pre>
{`
{
  "payments": "PaymentHistoryData[]"
}
`}
          </pre>
          <p>
            Where:
          </p>
          <pre>
{`
interface PaymentHistoryData {
  accountId: string
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: incoming | outgoing

  amount: string
  amountUsdAtPaymentTime: number | null
  amountUsdAtCurTime: number | null
  amountCurrencyAtPaymentTime: number | null
  amountCurrencyAtCurTime: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null

  tokenUsdPriceAtPaymentTime: number | null
  tokenUsdPriceAtCurTime: number | null

  currency: string | null
  currencyExchangeRateAtPaymentTime: number | null
  currencyExchangeRateAtCurTime: number | null

  paymentSuccess: {
    accountId: string
    paymentId: string
    timestamp: number
    blockchain: string
    transaction: string
    index: number
    email: string | null
    language: string
    currency: string
    amountCurrency: number
    description: string | null
    comment: string | null
  } | null

  ipnResult: {
    timestamp: number
    result: unknown,
    status: number,
    error?: string
  } | null
}
`}
          </pre>

          <h4>
            API method - list of supported blockchains
          </h4>
          <p>
            Data is updated once every 10 minutes. There is no point in asking for them more often.
          </p>
          <p>
            Request format:
          </p>
          <ul>
            <li>
              Endpoint - {config.config?.baseUrlApi}/api/v1/blockchains
            </li>
            <li>
              HTTP Method - GET
            </li>
            <li>
              Headers:
              <ul>
                <li>
                  x-api-key: <code>Ключ API</code>
                </li>
              </ul>
            </li>
          </ul>

          <p>
            Result:
          </p>
          <pre>
{`
{
  "blockchains": " BlockchainMeta[]"
}
`}
          </pre>
          <p>
            Where:
          </p>
          <pre>
{`
export type BlockchainMeta = EvmBlockchainMeta | TransferBlockchainMeta

export interface EvmBlockchainMeta {
  type: 'EVM'
  name: string
  shortName: string
  displayName: string
  defaultDecimals: number
  feeAssets: Asset[]
  addressPatterns: string[]
  logo: string
  color: string
  sort: number
  enabled: boolean
  chainId: string
  info: {
    infoType: 'EvmMetaInfo'
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
    addressUrl: string
    transactionUrl: string
  }
}

export interface TransferBlockchainMeta {
  type: 'TRANSFER'
  name: string
  shortName: string
  displayName: string
  defaultDecimals: number
  feeAssets: Asset[]
  addressPatterns: string[]
  logo: string
  color: string
  sort: number
  enabled: boolean
  chainId: null
  info: null
}
`}
          </pre>

          <h4>
            API method - list of supported tokens
          </h4>
          <p>
            Data is updated once every 10 minutes. There is no point in asking for them more often.
          </p>
          <p>
            Request format:
          </p>
          <ul>
            <li>
              Endpoint - {config.config?.baseUrlApi}/api/v1/tokens
            </li>
            <li>
              HTTP Method - GET
            </li>
            <li>
              Headers:
              <ul>
                <li>
                  x-api-key: <code>Ключ API</code>
                </li>
              </ul>
            </li>
          </ul>
          <p>
            Result:
          </p>
          <pre>
{`
{
  "token": "Token[]"
}
`}
          </pre>
            Where:
          <pre>
{`
  export type Token = {
    blockchain: string
    chainId: string | null
    address: string | null
    symbol: string
    name: string
    decimals: number
    image: string
    blockchainImage: string
    usdPrice: number | null
    isPopular: boolean
  }
`}
          </pre>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
        <p>
          С помощью API вы сможете:
        </p>
        <ul>
          <li>
            получать информацию о платежах,
          </li>
          <li>
            получать информацию о поддерживаемых блокчейнах,
          </li>
          <li>
            получать информацию о поддерживаемых токенах,
          </li>
        </ul>

        <p>
          Для того чтобы воспользоваться API вам необходимо сгенерировать <code>Ключ API</code> на странице <a href={`${config.config?.baseUrlAccount}/account_settings`} target="_blank">Настройки аккаунта</a> в разделе <code>Настройки API</code>.
        </p>
        <p>
          <Image src='../locales/ru/img/api_settings_1.png' fluid />
        </p>

        <h4>
          API метод - платежи
          </h4>
        <p>
          Данные обновляются 1 раз в 10 секунд. Запрашивать их чаще не имеет смысла.
        </p>
        <p>
          Формат запроса:
        </p>
        <ul>
          <li>
            Endpoint - {config.config?.baseUrlApi}/api/v1/payments?from=&to=. Опционально вы можете указывать <code>from</code> и <code>to</code> в unix epoch в секундах для фильтрации платежей по времени. Границы интервалов включены в результаты.
          </li>
          <li>
            HTTP Method - GET
          </li>
          <li>
            Headers:
            <ul>
              <li>
                x-api-key: <code>Ключ API</code>
              </li>
            </ul>
          </li>
        </ul>
        <p>
          Результат:
        </p>
        <pre>
{`
{
"payments": "PaymentHistoryData[]"
}
`}
        </pre>
        <p>
          Где:
        </p>
        <pre>
{`
interface PaymentHistoryData {
  accountId: string
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: incoming | outgoing

  amount: string
  amountUsdAtPaymentTime: number | null
  amountUsdAtCurTime: number | null
  amountCurrencyAtPaymentTime: number | null
  amountCurrencyAtCurTime: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null

  tokenUsdPriceAtPaymentTime: number | null
  tokenUsdPriceAtCurTime: number | null

  currency: string | null
  currencyExchangeRateAtPaymentTime: number | null
  currencyExchangeRateAtCurTime: number | null

  paymentSuccess: {
    accountId: string
    paymentId: string
    timestamp: number
    blockchain: string
    transaction: string
    index: number
    email: string | null
    language: string
    currency: string
    amountCurrency: number
    description: string | null
    comment: string | null
  } | null

  ipnResult: {
    timestamp: number
    result: unknown,
    status: number,
    error?: string
  } | null
}
`}
        </pre>

        <h4>
          API метод - список поддерживаемых блокчейнов
        </h4>
        <p>
          Данные обновляются 1 раз в 10 минут. Запрашивать их чаще не имеет смысла.
        </p>
        <p>
          Формат запроса:
        </p>
        <ul>
          <li>
            Endpoint - {config.config?.baseUrlApi}/api/v1/blockchains
          </li>
          <li>
            HTTP Method - GET
          </li>
          <li>
            Headers:
            <ul>
              <li>
                x-api-key: <code>Ключ API</code>
              </li>
            </ul>
          </li>
        </ul>

        <p>
          Результат:
        </p>
        <pre>
{`
{
"blockchains": " BlockchainMeta[]"
}
`}
        </pre>
        <p>
          Где:
        </p>
        <pre>
{`
export type BlockchainMeta = EvmBlockchainMeta | TransferBlockchainMeta

export interface EvmBlockchainMeta {
type: 'EVM'
name: string
shortName: string
displayName: string
defaultDecimals: number
feeAssets: Asset[]
addressPatterns: string[]
logo: string
color: string
sort: number
enabled: boolean
chainId: string
info: {
  infoType: 'EvmMetaInfo'
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
  addressUrl: string
  transactionUrl: string
}
}

export interface TransferBlockchainMeta {
type: 'TRANSFER'
name: string
shortName: string
displayName: string
defaultDecimals: number
feeAssets: Asset[]
addressPatterns: string[]
logo: string
color: string
sort: number
enabled: boolean
chainId: null
info: null
}
`}
        </pre>

        <h4>
          API метод - список поддерживаемых токенов
        </h4>
        <p>
          Данные обновляются 1 раз в 10 минут. Запрашивать их чаще не имеет смысла.
        </p>
        <p>
          Формат запроса:
        </p>
        <ul>
          <li>
            Endpoint - {config.config?.baseUrlApi}/api/v1/tokens
          </li>
          <li>
            HTTP Method - GET
          </li>
          <li>
            Headers:
            <ul>
              <li>
                x-api-key: <code>Ключ API</code>
              </li>
            </ul>
          </li>
        </ul>
        <p>
          Результат:
        </p>
        <pre>
{`
{
"token": "Token[]"
}
`}
        </pre>
          Где:
        <pre>
{`
export type Token = {
  blockchain: string
  chainId: string | null
  address: string | null
  symbol: string
  name: string
  decimals: number
  image: string
  blockchainImage: string
  usdPrice: number | null
  isPopular: boolean
}
`}
        </pre>
      </>
      )}
    </>
  )
}

export default Api
