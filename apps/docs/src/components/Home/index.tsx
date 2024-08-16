import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../constants'

const Home: React.FC = () => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <h1 className="mb-3">
        {t('components.home.title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            JaneDoe is a payment system that will allow you to accept cryptocurrencies.
          </p>

          <h2>
            No Fees
          </h2>
          <p>
            JaneDoe do not take fees. Fees could be taken only by the blockchains themselves for gas or by third-party services in the case of token conversion.
          </p>

          <h2>
            No Custodial Wallets
          </h2>
          <p>
            JaneDoe do not store your funds in custodial wallets in the case of Ethereum compatible blockchains. Your funds are stored in a smart contracts based on the <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>ERC1155 standard</a>.
          </p>
          <p>
            Smart contracts are not changeable and there is no mechanism for blocking your funds in our smart contracts. You even be able to interact with the smart contract directly, for example through <a href="https://etherscan.io/" target='_blank'>etherscan</a> to withdraw all your funds.
          </p>
          <p>
            Smart contract addresses can be found in <a href='#resources_contracts'>Contract Addresses</a>.
          </p>

          <h2>
            No Integration Required
          </h2>
          <p>
            You need to use payment links to accept payments. Links can be created independently on your side, no integration required. More details in <a href='#tutorials_receive_payments'>How to receive payments</a>.
          </p>
          <p>
            If you need JaneDoe can send notifications about new payments to your system. More details in <a href='#tutorials_notifications'>How to receive notifications about payments</a>.
          </p>
          <p>
            In addition, you can integrate with our API to retrieve payment history. More details in <a href='#tutorials_api'>How to use API</a>.
          </p>

          <h2>
            11 Blockchains, 9275 Tokens, 161 Fiat Currencies and 420 Crypto Wallets
          </h2>
          <p>
            A wide range of supported blockchains, tokens and crypto wallets will provide you with a wide range of client. Your clients will be able to pay in a way convenient for them.
          </p>
          <p>
            You will be able to set the payment amount in a fiat currency convenient for you. JaneDoe will automatically calculate the payment amount in tokens taking into account its price and fiat currency exchange rates.
          </p>
          <p>
            More details in <a href='#resources_blockchains'>Supported Blockchains</a>, <a href='#resources_tokens'>Supported Tokens</a> and <a href='#resources_currencies'>Supported Currencies</a>.
          </p>

          <h2>
            Automatic token conversion at a favorable rate through 107 exchangers
          </h2>
          <p>
            Let's say you decide to accept payments only in USDT. And your client has only ETH. He will still be able to make a payment. ETH will be automatically converted to USDT and sent to you in the amount you need.
          </p>
          <p>
            This way, your clients will be able to pay in the tokens they like, and you will receive the required amount in the tokens you need. To ensure the most favorable conversion rate, JaneDoe is integrated with 107 exchangers.
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            JaneDoe - это платежная система, которая позволит вам принимать криптовалюты.
          </p>

          <h2>
            Без комиссий
          </h2>
          <p>
            JaneDoe не берет комиссии. Комиссии могут брать только сами блокчейны за газ либо третьи сервисы, в случае конвертации токенов.
          </p>

          <h2>
            Без кастодиальных кошельков
          </h2>
          <p>
            JaneDoe не хранит ваши средства в кастодиальных кошельках в случае EVM совместимых блокчейнов. Ваши средства хранятся в смарт контрактах на основе <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>стандарта ERC1155</a>.
          </p>
          <p>
            Cмарт-контракты не изменяемы и в наших смарт-контрактах нет механизма блокировки ваших средств. Вы даже сможете напрямую взаимодействовать со смарт-контрактом, например, через <a href="https://etherscan.io/" target='_blank'>etherscan</a>, чтобы вывести все свои средства.
          </p>
          <p>
            Адреса смартконтрактов можно посмотреть в <a href='#resources_contracts'>Адреса контрактов</a>.
          </p>

          <h2>
            Не требуется интеграция
          </h2>
          <p>
            Чтобы получать платежи вам нужно использовать платежные ссылки. Ссылки могут быть созданы независимо на вашей стороне, никакой интеграции не требуется. Более подробная информация в <a href='#tutorials_receive_payments'>Как получать платежи</a>.
          </p>
          <p>
            Если вам потребуется JaneDoe может слать уведомления о новых платежах в вашу систему. Более подробная информация в <a href='#tutorials_notifications'>Как получать уведомления о платежах</a>.
          </p>
          <p>
            В дополнении вы можете интегрироваться с нашим API для получения истории платежей. Более подробная информация в <a href='#tutorials_api'>Как интегрироваться с API</a>.
          </p>

          <h2>
            11 блокчейнов, 9275 токенов, 161 фиатная валюта и 420 крипто кошельков
          </h2>
          <p>
            Широкий набор поддерживаемых блокчейнов, токенов и криптокошельков обеспечит вам широкий круг клиентов. Ваши клиенты смогут платить удобным им способом.
          </p>
          <p>
            Вы сможете задать сумму платежа в удобной вам фиатной валюте. JaneDoe автоматически рассчитает сумму платежа в токене учитывая его стоимость и курсы фиатных валют.
          </p>
          <p>
            Более подробная информация в <a href='#resources_blockchains'>Поддерживаемые блокчейны</a>, <a href='#resources_tokens'>Поддерживаемые токены</a> и <a href='#resources_currencies'>Поддерживаемые валюты</a>.
          </p>

          <h2>
            Автоматическая конвертация токенов по выгодному курсу через 107 обменников
          </h2>
          <p>
            Предположим, вы решили принимать платежи только в USDT. А ваш клиент имеет только ETH. Он все равно сможет совершить оплату. ETH будут автоматически конвертированы в USDT и отправлены вам в нужной вам сумме.
          </p>
          <p>
            Таким образом, ваши клиенты смогут платить в удобном им токене, а вы будете получать требуемую сумму в нужном вам токене. Чтобы обеспечить максимально выгодный курс конвертации JaneDoe интегрирована со 107 обменниками.
          </p>
        </>
      )}
    </>
  )
}

export default Home
