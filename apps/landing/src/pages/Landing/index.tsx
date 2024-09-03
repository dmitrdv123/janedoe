import React from 'react'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import { Asterisk, Circle, CurrencyBitcoin, CurrencyExchange, Envelope, Globe, Wallet } from 'react-bootstrap-icons'

import './index.css'

import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LandingNavbar from '../../components/navbars/LendingNavbar'
import { useConfig } from '../../context/config/hook'
import { MAILTO, SUPPORTED_LANGUAGES } from '../../constants'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import { Article } from '../../types/article'
import useApiRequestImmediate from '../../libs/hooks/useApiRequestImmediate'

const Landing: React.FC = () => {
  const contact = 'boss'
  const domain = 'mail.janedoe.fi'

  const { t, i18n } = useTranslation()
  const { hash } = useLocation()

  const config = useConfig()

  const {
    status: articleStatus,
    data: article
  } = useApiRequestImmediate<Article>(
    ApiWrapper.instance.latestArticle()
  )

  return (
    <div className="d-flex flex-column min-vh-100">
      <LandingNavbar />

      <main>
        <Container className='d-flex flex-column justify-content-center align-items-center min-vh-100'>
          <Row className="justify-content-center">
            <Col md={8} className='text-center'>
              <h1 className="display-1">
                {import.meta.env.VITE_APP_APP_NAME ?? 'JaneDoe Finance'}
              </h1>
              <p className="display-6 text-body-secondary">
                {t('pages.landing.title_desc')}
              </p>
              <p>
                <Button variant="primary" className="btn-lg" href={`${config.config?.baseUrlAccount}/${hash}`} target='_blank'>
                  {t('pages.landing.button')}
                </Button>
              </p>
            </Col>
            <Col md={4}>
              <ul className="list-unstyled lead text-body-secondary">
                <li >
                  <Circle className='me-2' size={10} />
                  <a href="#no_fees" className="text-secondary text-decoration-none">
                    {t('pages.landing.no_fees')}
                  </a>
                </li>
                <li >
                  <Circle className='me-2' size={10} />
                  <a href="#no_custodial" className="text-secondary text-decoration-none">
                    {t('pages.landing.no_custodial')}
                  </a>
                </li>
                <li >
                  <Circle className='me-2' size={10} />
                  <a href="#no_integration" className="text-secondary text-decoration-none">
                    {t('pages.landing.no_integration')}
                  </a>
                </li>
                <li >
                  <Circle className='me-2' size={10} />
                  <a href="#supported" className="text-secondary text-decoration-none">
                    {t('pages.landing.supported', { blockchains: '11', tokens: '9275', currencies: '161', wallets: '420' })}
                  </a>
                </li>
                <li >
                  <Circle className='me-2' size={10} />
                  <a href="#auto_convert" className="text-secondary text-decoration-none">
                    {t('pages.landing.auto_convert', { exchangers: '107' })}
                  </a>
                </li>
              </ul>
              <a href={config.config?.baseUrlDocs} target='_blank'>
                {t('pages.landing.read_more')}
              </a>
            </Col>
          </Row>
        </Container>

        <div className="container marketing">

          <hr className="featurette-divider" id="common" />

          {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
            <>
              <Row className="featurette">
                <Col>
                  <blockquote className="blockquote border-start border-5 ps-3">
                    <h2 className="featurette-heading fw-normal lh-1">
                      Why do I need an intermediary to accept cryptocurrency payments at all?
                    </h2>
                    <p>
                      Blockchains themselves are a kind of payment systems that is designed to send payments. Why can't just accept payments to my own wallet address?
                    </p>
                  </blockquote>

                  <p className='lead'>
                    Let's estimate the complexity of JaneDoe proposal
                  </p>

                  <p className='lead'>
                    <Badge bg="secondary">Complexity</Badge> = f ( <Badge bg="secondary">11 Blockchains</Badge> <Asterisk size={8} /> <Badge bg="secondary">9275 Tokens</Badge> <Asterisk size={8} /> <Badge bg="secondary">161 Fiat Currencies</Badge> <Asterisk size={8} /> <Badge bg="secondary">420 Crypto Wallets</Badge> <Asterisk size={8} /> <Badge bg="secondary">107 Exchangers</Badge>  <Asterisk size={8} /> <Badge bg="secondary">Number of Payments</Badge> )
                  </p>

                  <p className='lead'>
                    It is almost impossible to manage such system in the manual mode, even if you have a small number of payments. Therefore JaneDoe offers you a payment system to accept payments in cryptocurrency with zero fees.
                  </p>
                </Col>
              </Row>

              <hr className="featurette-divider" id='no_fees' />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.no_fees')}
                  </h2>
                  <p className="lead">
                    JaneDoe do not take fees. Fees could be taken only by the blockchains themselves for gas or by third-party services in the case of token exchange.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    0%
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='no_custodial' />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.no_custodial')}
                  </h2>
                  <p className="lead">
                    JaneDoe do not store your funds in custodial wallets in the case of Ethereum compatible blockchains. Your funds are stored in a smart contracts based on the <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>ERC1155 standard</a>.
                  </p>
                  <p className='lead'>
                    Smart contracts are not changeable and there is no mechanism for blocking your funds in our smart contracts. You even be able to interact with the smart contract directly, for example through <a href="https://etherscan.io/" target='_blank'>etherscan</a> to withdraw all your funds.
                  </p>
                  <p className='lead'>
                    Smart contract addresses can be found in <a href={`${config.config?.baseUrlDocs}/#resources_contracts`} target='_blank'>Contract Addresses</a>.
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <Wallet size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='no_integration' />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.no_integration')}
                  </h2>
                  <p className="lead">
                    You need to use payment links to accept payments. Links can be created independently on your side, no integration required. More details in <a href={`${config.config?.baseUrlDocs}/#tutorials_receive_payments`} target='_blank'>How to receive payments</a>.
                  </p>
                  <p className="lead">
                    If you need JaneDoe can send notifications about new payments to your system. More details in <a href={`${config.config?.baseUrlDocs}/#tutorials_notifications`} target='_blank'>How to receive notifications about payments</a>.
                  </p>
                  <p className="lead">
                    In addition, you can integrate with our API to retrieve payment history. More details in <a href={`${config.config?.baseUrlDocs}/#tutorials_api`} target='_blank'>How to use API</a>.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <Globe size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='supported' />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.supported', { blockchains: '11', tokens: '9275', currencies: '161', wallets: '420' })}
                  </h2>
                  <p className="lead">
                    A wide range of supported blockchains, tokens and crypto wallets will provide you with a wide range of client. Your clients will be able to pay in a way convenient for them.
                  </p>
                  <p className="lead">
                    You will be able to set the payment amount in a fiat currency convenient for you. JaneDoe will automatically calculate the payment amount in tokens taking into account its price and fiat currency exchange rates.
                  </p>
                  <p className="lead">
                    More details in <a href={`${config.config?.baseUrlDocs}/#resources_blockchains`} target='_blank'>Supported Blockchains</a>, <a href={`${config.config?.baseUrlDocs}/#resources_tokens`} target='_blank'>Supported Tokens</a> and <a href={`${config.config?.baseUrlDocs}/#resources_currencies`} target='_blank'>Supported Currencies</a>.
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <CurrencyBitcoin size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='auto_convert' />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.auto_convert', { exchangers: '107' })}
                  </h2>
                  <p className="lead">
                    Let's say you decide to accept payments only in USDT. And your client has only ETH. He will still be able to make a payment. ETH will be automatically converted to USDT and sent to you in the amount you need.
                  </p>
                  <p className="lead">
                    This way, your clients will be able to pay in the tokens they like, and you will receive the required amount in the tokens you need. To ensure the most favorable exchange rate, JaneDoe is integrated with 107 exchangers.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <CurrencyExchange size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='use_cases' />

              <Row className="featurette">
                <Col lg={12}>
                  <blockquote className="blockquote border-start border-5 ps-3">
                    <h2 className="featurette-heading fw-normal lh-1" >
                      <small className='text-body-secondary'>Use Cases 1.</small> VPN Service with Payment via Messenger Bot
                    </h2>
                    <p>
                      VPN service with a several thousands users. It interacts with its users via a bot in the Telegram messenger. It processes thousands of small payments. The bot's logic requires cryptocurrency payments to be implemented.
                    </p>
                  </blockquote>
                  <p className="lead">
                    The user in the Telegram bot selects a tariff and clicks the pay button. The user is shown a list of payment methods. A new method is added to this list - <code>Payment in Сryptocurrency</code>.
                  </p>
                  <p className="lead">
                    This method is a link in the format <code>{config.config?.baseUrlPayment}/000000000001/&lt;payment id&gt;/&lt;currency&gt;/&lt;amount&gt;</code>. Links are created independently on the VPN service side without any interaction with JaneDoe. The internal payment identifier is used as the <code>&lt;payment id&gt;</code>. <code>USD</code> is always used as the <code>&lt;currency&gt;</code>. The payment amount for the selected tariff is used as the <code>&lt;amount&gt;</code>.
                  </p>
                  <p className="lead">
                    When user clicks on the link, the JaneDoe payment form opens in the browser, where the user makes the payment. After successful payment, JaneDoe sends a payment notification to the VPN service backend. There, the incoming amount is compared with the expected amount. After which the access key is activated.
                  </p>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={12}>
                  <blockquote className="blockquote border-start border-5 ps-3">
                    <h2 className="featurette-heading fw-normal lh-1">
                      <small className='text-body-secondary'>Use Cases 2.</small> Gaming service with internal balance top-up
                    </h2>
                    <p>
                      Gaming service with tens of thousands users. Users have internal balances from which they pay for the service. It is necessary to implement cryptocurrency top-up.
                    </p>
                  </blockquote>
                  <p className="lead">
                    The user selects the amount of top-up in fiat currency of their country (USD, EUR, etc.). Then selects the payment method - bank card, payment system, etc. A new method is being added to this list - <code>Payment in cryptocurrency</code>.
                  </p>
                  <p className="lead">
                    This method is a link in the format <code>{config.config?.baseUrlPayment}/000000000001/&lt;payment id&gt;/&lt;currency&gt;/&lt;amount&gt;</code>. Links are created independently on the gaming service side without any interaction with JaneDoe. The internal identifier of top-up operation is used as the <code>&lt;payment id&gt;</code>. <code>&lt;Сurrency&gt;</code> is the currency of the user's country, such as the <code>USD</code>. <code>&lt;Amount&gt;</code> is the top-up amount specified by the user.
                  </p>
                  <p className="lead">
                    When user clicks on the link, the JaneDoe payment form opens in the browser, where the user makes the payment. After successful payment, JaneDoe sends a payment notification to the gaming service backend. There, the user's balance is topped up on the received amount.
                  </p>
                </Col>
              </Row>

              <hr className="featurette-divider" id='contact_and_links' />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.contact_and_links')}
                  </h2>
                  <p className="lead">
                    Hello, I am founder of JaneDoe.fi. Please, write me to
                    <a target="_blank" rel="noopener noreferrer" className='ms-2' href={`${MAILTO}:${contact}@${domain}`}>
                      <span>{contact}</span>
                      <span>@</span>
                      <span>{domain}</span>
                    </a>.
                  </p>
                  <p className="lead">
                    Articles about us and the industry on
                    <a target="_blank" className='ms-2' href='https://medium.com/@boss_1691'>
                      our Medium blog.
                    </a>
                  </p>
                  <p className="lead">
                    News and announcements on
                    <a target="_blank" className='ms-2' href='https://t.me/janedoe_fi'>
                      our Telegram channel.
                    </a>
                  </p>
                  <p className="lead">
                    Useful videos on
                    <a target="_blank" className='ms-2' href='https://www.youtube.com/@janedoefinance-q6x'>
                      our YouTube channel.
                    </a>
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <Envelope size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='social_media' />
            </>
          )}

          {(i18n.language.toLocaleLowerCase() === 'ru') && (
            <>
              <Row className="featurette">
                <Col>
                  <blockquote className="blockquote border-start border-5 ps-3">
                    <h2 className="featurette-heading fw-normal lh-1">
                      Зачем вообще мне нужен посредник для приема платежей в криптовалюте?
                    </h2>
                    <p>
                      Блокчейны сами по себе это своего рода платежные системы, которые предназначены для отправки платежей. Почему нельзя просто принимать платежи на адрес своего кошелька?
                    </p>
                  </blockquote>

                  <p className='lead'>
                    Давайте оценим сложность того, что предлагает JaneDoe
                  </p>

                  <p className='lead'>
                    <Badge bg="secondary">Сложность</Badge> = f ( <Badge bg="secondary">11 блокчейнов</Badge> <Asterisk size={8} /> <Badge bg="secondary">9275 токенов</Badge> <Asterisk size={8} /> <Badge bg="secondary">161 фиатная валюта</Badge> <Asterisk size={8} /> <Badge bg="secondary">420 крипто кошельков</Badge> <Asterisk size={8} /> <Badge bg="secondary">107 обменников</Badge>  <Asterisk size={8} /> <Badge bg="secondary">Количество платежей</Badge> )
                  </p>

                  <p className='lead'>
                    Управлять таким в ручном режиме практически невозможно, даже если платежей немного. Поэтому JaneDoe предлагает вам автоматизированную систему для приема платежей в криптовалюте с нулевыми комиссиями.
                  </p>
                </Col>
              </Row>

              <hr className="featurette-divider" id='no_fees' />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.no_fees')}
                  </h2>
                  <p className="lead">
                    JaneDoe не берет комиссии. Комиссии могут брать только сами блокчейны за газ либо третьи сервисы, в случае конвертации токенов.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    0%
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='no_custodial' />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.no_custodial')}
                  </h2>
                  <p className="lead">
                    JaneDoe не хранит ваши средства в кастодиальных кошельках в случае EVM совместимых блокчейнов. Ваши средства хранятся в смарт контрактах на основе <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>стандарта ERC1155</a>.
                  </p>
                  <p className='lead'>
                    Cмарт-контракты не изменяемы и в наших смарт-контрактах нет механизма блокировки ваших средств. Вы даже сможете напрямую взаимодействовать со смарт-контрактом, например, через <a href="https://etherscan.io/" target='_blank'>etherscan</a>, чтобы вывести все свои средства.
                  </p>
                  <p className='lead'>
                    Адреса смартконтрактов можно посмотреть в <a href={`${config.config?.baseUrlDocs}/#resources_contracts`} target='_blank'>Адреса контрактов</a>.
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <Wallet size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='no_integration' />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.no_integration')}
                  </h2>
                  <p className="lead">
                    Чтобы получать платежи вам нужно использовать платежные ссылки. Ссылки могут быть созданы независимо на вашей стороне, никакой интеграции не требуется. Более подробная информация в <a href={`${config.config?.baseUrlDocs}/#tutorials_receive_payments`} target='_blank'>Как получать платежи</a>.
                  </p>
                  <p className="lead">
                    Если вам потребуется JaneDoe может слать уведомления о новых платежах в вашу систему. Более подробная информация в <a href={`${config.config?.baseUrlDocs}/#tutorials_notifications`} target='_blank'>Как получать уведомления о платежах</a>.
                  </p>
                  <p className="lead">
                    В дополнении вы можете интегрироваться с нашим API для получения истории платежей. Более подробная информация в <a href={`${config.config?.baseUrlDocs}/#tutorials_api`} target='_blank'>Как интегрироваться с API</a>.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <Globe size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='supported' />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.supported', { blockchains: '11', tokens: '9275', currencies: '161', wallets: '420' })}
                  </h2>

                  <p className="lead">
                    Широкий набор поддерживаемых блокчейнов, токенов и криптокошельков обеспечит вам широкий круг клиентов. Ваши клиенты смогут платить удобным им способом.
                  </p>

                  <p className="lead">
                    Вы сможете задать сумму платежа в удобной вам фиатной валюте. JaneDoe автоматически рассчитает сумму платежа в токене учитывая его стоимость и курсы фиатных валют.
                  </p>

                  <p className="lead">
                    Более подробная информация в <a href={`${config.config?.baseUrlDocs}/#resources_blockchains`} target='_blank'>Поддерживаемые блокчейны</a>, <a href={`${config.config?.baseUrlDocs}/#resources_tokens`} target='_blank'>Поддерживаемые токены</a> и <a href={`${config.config?.baseUrlDocs}/#resources_currencies`} target='_blank'>Поддерживаемые валюты</a>.
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <CurrencyBitcoin size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='auto_convert' />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.auto_convert', { exchangers: '107' })}
                  </h2>
                  <p className="lead">
                    Предположим, вы решили принимать платежи только в USDT. А ваш клиент имеет только ETH. Он все равно сможет совершить оплату. ETH будут автоматически конвертированы в USDT и отправлены вам в нужной вам сумме.
                  </p>
                  <p className="lead">
                    Таким образом, ваши клиенты смогут платить в удобном им токене, а вы будете получать требуемую сумму в нужном вам токене. Чтобы обеспечить максимально выгодный курс конвертации JaneDoe интегрирована со 107 обменниками.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <CurrencyExchange size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='use_cases' />

              <Row className="featurette">
                <Col lg={12}>
                  <blockquote className="blockquote border-start border-5 ps-3">
                    <h2 className="featurette-heading fw-normal lh-1">
                      <small className='text-body-secondary'>Пример использования 1.</small> VPN сервис с оплатой через бота в мессенджере
                    </h2>
                    <p>
                      VPN сервис с несколькими тысячами пользователей. Он взаимодействует со своими пользователями с помощью бота в мессенджере Telegram. Обрабатывает тысячи мелких платежей. В логику работы бота требуется внедрить оплату в криптовалюте.
                    </p>
                  </blockquote>
                  <p className="lead">
                    Пользователь в Telegram боте выбирает тариф и нажимает кнопку оплатить. Пользователю показываются список способов платежей. В этот список добавляется новый способ - <code>Платеж в криптовалюте</code>.
                  </p>
                  <p className="lead">
                    Этот способ - это ссылка в формате <code>{config.config?.baseUrlPayment}/000000000001/&lt;payment id&gt;/&lt;currency&gt;/&lt;amount&gt;</code>. Ссылки создаются независимо на стороне VPN сервиса без какого либо взаимодействия с JaneDoe. В качестве <code>&lt;payment id&gt;</code> используется внутренний идентификатор платежа. В качестве <code>&lt;currency&gt;</code> всегда используется <code>USD</code>. В качестве <code>&lt;amount&gt;</code> используется сумма платежа для выбранного тарифа.
                  </p>
                  <p className="lead">
                    При нажатии на ссылку в браузере открывается платежная форма JaneDoe, где пользователь совершает оплату. После успешной оплаты JaneDoe отправляет уведомление о платеже в бэкенд VPN сервиса. Там происходит сверка пришедшей суммы с ожидаемой. После чего активируется ключ доступа.
                  </p>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={12}>
                  <blockquote className="blockquote border-start border-5 ps-3">
                    <h2 className="featurette-heading fw-normal lh-1">
                      <small className='text-body-secondary'>Пример использования 2.</small> Игровой сервис с пополнением внутреннего баланса
                    </h2>
                    <p>
                      Игровой сервис с несколькими десятками тысяч пользователей. Пользователи имеют внутренние балансы, с которых они оплачивают услуги сервиса. Необходимо внедрить пополнение баланса в криптовалюте.
                    </p>
                  </blockquote>
                  <p className="lead">
                    Пользователь выбирает сумму пополнения в фиатной валюте страны регистрации (USD, EUR и т.д.). Затем выбирает способ платежей - банковской картой, платежной системой и др. В этот список добавляется новый способ - <code>Платеж в криптовалюте</code>.
                  </p>
                  <p className="lead">
                    Этот способ - это ссылка в формате <code>{config.config?.baseUrlPayment}/000000000001/&lt;payment id&gt;/&lt;currency&gt;/&lt;amount&gt;</code>. Ссылки создаются независимо на стороне игрового сервиса без какого либо взаимодействия с JaneDoe. В качестве <code>&lt;payment id&gt;</code> используется внутренний идентификатор пополнения счета. В качестве <code>&lt;currency&gt;</code> используется валюта страны пользователя, например, <code>USD</code>. В качестве <code>&lt;amount&gt;</code> используется сумма пополнения, заданная пользователем.
                  </p>
                  <p className="lead">
                    При нажатии на ссылку в браузере открывается платежная форма JaneDoe, где пользователь совершает оплату. После успешной оплаты JaneDoe отправляет уведомление о платеже в бэкенд игрового сервиса. Там происходит пополнение баланса пользователя на основе пришедшей суммы.
                  </p>
                </Col>
              </Row>

              <hr className="featurette-divider" id='contact_and_links' />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.contact_and_links')}
                  </h2>
                  <p className="lead">
                    Привет, я основатель JaneDoe.fi. Пожалуйста, напишите мне
                    <a target="_blank" rel="noopener noreferrer" className='ms-2' href={`${MAILTO}:${contact}@${domain}`}>
                      <span>{contact}</span>
                      <span>@</span>
                      <span>{domain}</span>
                    </a>.
                  </p>
                  <p className="lead">
                    Статьи о нас и индустрии на
                    <a target="_blank" className='ms-2' href='https://medium.com/@boss_1691'>
                      нашем блоге на Medium.
                    </a>
                  </p>
                  <p className="lead">
                    Новости и анонсы в
                    <a target="_blank" className='ms-2' href='https://t.me/janedoe_fi'>
                      нашем Telegram канале.
                    </a>
                  </p>
                  <p className="lead">
                    Полезные видео на
                    <a target="_blank" className='ms-2' href='https://www.youtube.com/@janedoefinance-q6x'>
                       нашем YouTube канале.
                    </a>
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block bg-light">
                  <div className='featurette-image'>
                    <Envelope size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" id='social_media' />
            </>
          )}

          {(articleStatus === 'success' && !!article) && (
            <>
              <Row className="featurette">
                <Col>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {article.title}
                    <small className="text-body-secondary ms-3">
                      ({new Date(1000 * article.timestamp).toLocaleDateString()})
                    </small>
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  <p className="lead">
                    <a target="_blank" href={article.link}>
                      {t('pages.landing.read_more')}
                    </a>
                    <a className='ms-3' href='/blog'>
                      {t('pages.landing.all_blog')}
                    </a>
                  </p>
                </Col>
              </Row>

              <hr className="featurette-divider" />
            </>
          )}
        </div>

        <footer className="container">
          <p className="float-end"><a href="#">{t('pages.landing.to_top')}</a></p>
          <p>© 2024 JaneDoe</p>
        </footer>
      </main>

    </div >
  )
}

export default Landing
