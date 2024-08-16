import React from 'react'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import { Asterisk, Circle, CurrencyBitcoin, CurrencyExchange, Envelope, Globe, Wallet } from 'react-bootstrap-icons'

import './index.css'

import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LandingNavbar from '../../components/navbars/LendingNavbar'
import { useConfig } from '../../context/config/hook'
import { MAILTO, SUPPORTED_LANGUAGES } from '../../constants'

const Landing: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { hash } = useLocation()

  const config = useConfig()

  const contact = 'boss'
  const domain = 'mail.janedoe.fi'

  return (
    <div className="d-flex flex-column min-vh-100">
      <LandingNavbar />

      <main>
        <Container className='d-flex flex-column justify-content-center align-items-center min-vh-100'>
          <Row className="justify-content-center">
            <Col md={8} className='text-center'>
              <h1 className="display-1">
                {import.meta.env.VITE_APP_APP_NAME ?? 'Jane Doe'}
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

          <hr className="featurette-divider" />

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

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_fees'>
                    {t('pages.landing.no_fees')}
                  </h2>
                  <p className="lead">
                    JaneDoe do not take fees. Fees could be taken only by the blockchains themselves for gas or by third-party services in the case of token conversion.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block">
                  <div className='featurette-image'>
                    0%
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='no_custodial'>
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
                <Col lg={5} className="d-none d-lg-block">
                  <div className='featurette-image'>
                    <Wallet size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_integration'>
                    {t('pages.landing.no_integration')}
                  </h2>
                  <p className="lead">
                    You need to use payment links to accept payments. Links can be created independently on your side, no integration required. More details in <a href='#tutorials_receive_payments'>How to receive payments</a>.
                  </p>
                  <p className="lead">
                    If you need JaneDoe can send notifications about new payments to your system. More details in <a href='#tutorials_notifications'>How to receive notifications about payments</a>.
                  </p>
                  <p className="lead">
                    In addition, you can integrate with our API to retrieve payment history. More details in <a href='#tutorials_api'>How to use API</a>.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block">
                  <div className='featurette-image'>
                    <Globe size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='supported'>
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
                <Col lg={5} className="d-none d-lg-block">
                  <div className='featurette-image'>
                    <CurrencyBitcoin size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='auto_convert'>
                    {t('pages.landing.auto_convert', { exchangers: '107' })}
                  </h2>
                  <p className="lead">
                    Let's say you decide to accept payments only in USDT. And your client has only ETH. He will still be able to make a payment. ETH will be automatically converted to USDT and sent to you in the amount you need.
                  </p>
                  <p className="lead">
                    This way, your clients will be able to pay in the tokens they like, and you will receive the required amount in the tokens you need. To ensure the most favorable conversion rate, JaneDoe is integrated with 107 exchangers.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block">
                  <div className='featurette-image'>
                    <CurrencyExchange size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.questions')}
                  </h2>
                  <p className="lead">
                    Hello, I am founder of JaneDoe.fi. Please, write me to
                    <a target="_blank" rel="noopener noreferrer" className='ms-2' href={`${MAILTO}:${contact}@${domain}`}>
                      <span>{contact}</span>
                      <span>@</span>
                      <span>{domain}</span>
                    </a>
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block">
                  <div className='featurette-image'>
                    <Envelope size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />
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

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_fees'>
                    {t('pages.landing.no_fees')}
                  </h2>
                  <p className="lead">
                    JaneDoe не берет комиссии. Комиссии могут брать только сами блокчейны за газ либо третьи сервисы, в случае конвертации токенов.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block">
                  <div className='featurette-image'>
                    0%
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='no_custodial'>
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
                <Col lg={5} className="d-none d-lg-block">
                  <div className='featurette-image'>
                    <Wallet size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_integration'>
                    {t('pages.landing.no_integration')}
                  </h2>
                  <p className="lead">
                    Чтобы получать платежи вам нужно использовать платежные ссылки. Ссылки могут быть созданы независимо на вашей стороне, никакой интеграции не требуется. Более подробная информация в <a href='#tutorials_receive_payments'>Как получать платежи</a>.
                  </p>
                  <p className="lead">
                    Если вам потребуется JaneDoe может слать уведомления о новых платежах в вашу систему. Более подробная информация в <a href='#tutorials_notifications'>Как получать уведомления о платежах</a>.
                  </p>
                  <p className="lead">
                    В дополнении вы можете интегрироваться с нашим API для получения истории платежей. Более подробная информация в <a href='#tutorials_api'>Как интегрироваться с API</a>.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block">
                  <div className='featurette-image'>
                    <Globe size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='supported'>
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
                <Col lg={5} className="d-none d-lg-block">
                  <div className='featurette-image'>
                    <CurrencyBitcoin size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='auto_convert'>
                    {t('pages.landing.auto_convert', { exchangers: '107' })}
                  </h2>
                  <p className="lead">
                    Предположим, вы решили принимать платежи только в USDT. А ваш клиент имеет только ETH. Он все равно сможет совершить оплату. ETH будут автоматически конвертированы в USDT и отправлены вам в нужной вам сумме.
                  </p>
                  <p className="lead">
                    Таким образом, ваши клиенты смогут платить в удобном им токене, а вы будете получать требуемую сумму в нужном вам токене. Чтобы обеспечить максимально выгодный курс конвертации JaneDoe интегрирована со 107 обменниками.
                  </p>
                </Col>
                <Col lg={5} className="order-md-1 d-none d-lg-block">
                  <div className='featurette-image'>
                    <CurrencyExchange size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col lg={7}>
                  <h2 className="featurette-heading fw-normal lh-1">
                    {t('pages.landing.questions')}
                  </h2>
                  <p className="lead">
                    Привет, я основатель JaneDoe.fi. Пожалуйста, напишите мне
                    <a target="_blank" rel="noopener noreferrer" className='ms-2' href={`${MAILTO}:${contact}@${domain}`}>
                      <span>{contact}</span>
                      <span>@</span>
                      <span>{domain}</span>
                    </a>
                  </p>
                </Col>
                <Col lg={5} className="d-none d-lg-block">
                  <div className='featurette-image'>
                    <Envelope size={100} />
                  </div>
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
