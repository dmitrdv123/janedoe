import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../constants'
import { useConfig } from '../../context/config/hook'

const Home: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

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
            No KYC
          </h2>
          <p>
            You do not need to go through the KYC procedure to start using our service. You only need to have a cryptowallet with which you can log in and to which you will withdraw funds. More details in <a href='#tutorials_create_account'>How to create account</a> and <a href='#tutorials_withdraw'>How to withdraw funds</a>.
          </p>
          <p>
            You may be blocked only if you accept payments for illegal services or goods. However, you will still be able to interact with the smart contract directly, for example through <a href="https://etherscan.io/" target='_blank'>etherscan</a> and withdraw all funds. Since smart contracts are not changeable and there is no mechanism for blocking funds in our smart contracts.
          </p>

          <h2>
            No fees
          </h2>
          <p>
            We do not take fees. Fees could be taken only by the blockchains themselves for gas or by third-party services in the case of token conversion.
          </p>

          <h2>
            No custodial wallets
          </h2>
          <p>
            We do not store your funds in custodial wallets in the case of Ethereum compatible blockchains. Your funds are stored in a smart contract based on the <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>ERC1155 standard</a> and can be withdrawn to your wallet. Smart contract addresses can be found in <a href='#resources_contracts'>Contract Addresses</a>.
          </p>

          <h2>
            No integration required
          </h2>
          <p>
            You just need to post links in a specific format to accept payments. For example, <code>{config.config?.baseUrlPayment}/000000000001/123/usd/100</code>. Links can be created independently on your side, no integration required. More details in <a href='#tutorials_receive_payments'>How to receive payments</a>.
          </p>
          <p>
            But if you need to receive payment history, you can integrate with our API. More details in <a href='#tutorials_api'>How to use API</a>.
          </p>
          <p>
            In addition, you can configure to receive notifications about new payments. More details in <a href='#tutorials_notifications'>How to receive notifications about payments</a>.
          </p>

          <h2>
            N blockchains, M tokens and K currencies
          </h2>
          <p>
            We support N blockchains, M tokens and K currencies as payment methods. More details in <a href='#resources_blockchains'>Supported Blockchains</a>, <a href='#resources_tokens'>Supported Tokens</a> and <a href='#resources_currencies'>Supported Currencies</a>.
          </p>

          <h2>
            Automatic token conversion
          </h2>
          <p>
            Let's say you decide to only accept payments on the Ethereum blockchain in USDT. Your client only has USDC on the Polygon blockchain. He will still be able to make the payment. USDC will be automatically converted to USDT and sent to your.
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            JaneDoe - это платежная система, которая позволит вам принимать криптовалюты.
          </p>

          <h2>
            Без KYC
          </h2>
          <p>
            Вам не нужно проходить процедуру KYC, чтобы начать пользоваться нашим сервисом. Вам необходимо только иметь криптокошелек, с помощью которого вы сможете авторизоваться и на который вы будете выводить средства. Более подробная информация в <a href='#tutorials_create_account'>Как создать учетную запись</a> и <a href='#tutorials_withdraw'>Как выводить средства</a>.
          </p>
          <p>
            Вас могут заблокировать только в том случае, если вы принимаете платежи за незаконные услуги или товары. Однако вы по-прежнему сможете напрямую взаимодействовать со смарт-контрактом, например, через <a href="https://etherscan.io/" target='_blank'>etherscan</a> и выводить все средства. Так как смарт-контракты не изменяемы и в наших смарт-контрактах нет механизма блокировки средств.
          </p>

          <h2>
            Не требуется интеграция
          </h2>
          <p>
            Вам нужно просто размещать ссылки в определенном формате, чтобы принять платежи. Например, <code>{config.config?.baseUrlPayment}/000000000001/123/usd/100</code>. Ссылки могут быть созданы независимо на вашей стороне, никакой интеграции не требуется. Более подробная информация в <a href='#tutorials_receive_payments'>Как получать платежи</a>.
          </p>
          <p>
            Но если вам требуется получать историю платежей вы сможете интегрироваться с нашим API. Более подробная информация в <a href='#tutorials_api'>Как интегрироваться с API</a>.
          </p>
          <p>
            В дополнении вы можете настроить получение уведомлений о новых платежах. Более подробная информация в <a href='#tutorials_notifications'>Как получать уведомления о платежах</a>.
          </p>

          <h2>
            Без комиссий
          </h2>
          <p>
            Мы не берем комиссии. Комиссии могут брать только сами блокчейны за газ либо третьи сервисы, в случае конвертации токенов.
          </p>

          <h2>
            Без кастодиальных кошельков
          </h2>
          <p>
            Мы не храним ваши средства в кастодиальных кошельках в случае EVM совместимых блокчейнов. Ваши средства хранятся в смарт контракте на основе <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>стандарта ERC1155</a> и могут быть выведены на ваш кошелек. Адреса смартконтрактов можно посмотреть в <a href='#resources_contracts'>Адреса контрактов</a>.
          </p>

          <h2>
            N блокчейнов, M токенов и K валют
          </h2>
          <p>
            Мы поддерживаем N блокчейнов, М токенов и K валют в качестве способов оплаты. Более подробная информация в <a href='#resources_blockchains'>Поддерживаемые блокчейны</a>, <a href='#resources_tokens'>Поддерживаемые токены</a> и <a href='#resources_currencies'>Поддерживаемые валюты</a>.
          </p>

          <h2>
            Автоматическая конвертация токенов
          </h2>
          <p>
            Предположим, вы решили принимать платежи только в блокчейне Ethereum в USDT. И ваш клиент имеет только USDC в блокчейне Polygon. Он все равно сможет совершить оплату. USDC будут автоматически конвертированы в USDT и отправлены вам.
          </p>
        </>
      )}
    </>
  )
}

export default Home
