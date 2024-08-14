import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { Bank, Circle, CurrencyBitcoin, CurrencyExchange, Envelope, Globe, Wallet } from 'react-bootstrap-icons'

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
                  <a href="#supported" className="text-secondary text-decoration-none">
                    {t('pages.landing.supported', { blockchains: '11', tokens: '9275', currencies: '161', wallets: '420' })}
                  </a>
                </li>
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
                  <a href="#no_kyc" className="text-secondary text-decoration-none">
                    {t('pages.landing.no_kyc')}
                  </a>
                </li>
                <li >
                  <Circle className='me-2' size={10} />
                  <a href="#auto_convert" className="text-secondary text-decoration-none">
                    {t('pages.landing.auto_convert')}
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
                <Col md={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='supported'>
                    {t('pages.landing.supported', { blockchains: '11', tokens: '9275', currencies: '161', wallets: '420' })}
                  </h2>
                  <p className="lead">
                    We support 11 blockchains, 9275 tokens, 161 fiat currencies and 420 crypto wallets as payment methods. More details in <a href='#resources_blockchains'>Supported Blockchains</a>, <a href='#resources_tokens'>Supported Tokens</a> and <a href='#resources_currencies'>Supported Currencies</a>.
                  </p>
                </Col>
                <Col md={5} className="d-none d-md-block">
                  <div className='featurette-image'>
                    <CurrencyBitcoin size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_fees'>
                    {t('pages.landing.no_fees')}
                  </h2>
                  <p className="lead">
                    We do not take fees. Fees could be taken only by the blockchains themselves for gas or by third-party services in the case of token conversion.
                  </p>
                </Col>
                <Col md={5} className="order-md-1 d-none d-md-block">
                  <div className='featurette-image'>
                    0%
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='no_custodial'>
                    {t('pages.landing.no_custodial')}
                  </h2>
                  <p className="lead">
                    We do not store your funds in custodial wallets in the case of Ethereum compatible blockchains. Your funds are stored in a smart contract based on the <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>ERC1155 standard</a> and can be withdrawn to your wallet. Smart contract addresses can be found in <a href='#resources_contracts'>Contract Addresses</a>.
                  </p>
                </Col>
                <Col md={5} className="d-none d-md-block">
                  <div className='featurette-image'>
                    <Wallet size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_integration'>
                    {t('pages.landing.no_integration')}
                  </h2>
                  <p className="lead">
                    You just need to post links in a specific format to accept payments. For example, <code>{config.config?.baseUrlPayment}/000000000001/123/usd/100</code>. Links can be created independently on your side, no integration required. More details in <a href='#tutorials_receive_payments'>How to receive payments</a>.
                  </p>
                  <p className="lead">
                    But if you need to receive payment history, you can integrate with our API. More details in <a href='#tutorials_api'>How to use API</a>.
                  </p>
                  <p className="lead">
                    In addition, you can configure to receive notifications about new payments. More details in <a href='#tutorials_notifications'>How to receive notifications about payments</a>.
                  </p>
                </Col>
                <Col md={5} className="order-md-1 d-none d-md-block">
                  <div className='featurette-image'>
                    <Globe size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='no_kyc'>
                    {t('pages.landing.no_kyc')}
                  </h2>
                  <p className="lead">
                    You do not need to go through the KYC procedure to start using our service. You only need to have a cryptowallet with which you can log in and to which you will withdraw funds. More details in <a href='#tutorials_create_account'>How to create account</a> and <a href='#tutorials_withdraw'>How to withdraw funds</a>.
                  </p>
                  <p className="lead">
                    You may be blocked only if you accept payments for illegal services or goods. However, you will still be able to interact with the smart contract directly, for example through <a href="https://etherscan.io/" target='_blank'>etherscan</a> and withdraw all funds. Since smart contracts are not changeable and there is no mechanism for blocking funds in our smart contracts.
                  </p>
                </Col>
                <Col md={5} className="d-none d-md-block">
                  <div className='featurette-image'>
                    <Bank size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='auto_convert'>
                    {t('pages.landing.auto_convert')}
                  </h2>
                  <p className="lead">
                    Let's say you decide to only accept payments in USDT. And your client only has USDC. He will still be able to make the payment. USDC will be automatically converted to USDT and sent to you.
                  </p>
                </Col>
                <Col md={5} className="order-md-1 d-none d-md-block">
                  <div className='featurette-image'>
                    <CurrencyExchange size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7}>
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
                <Col md={5} className="d-none d-md-block">
                  <div className='featurette-image'>
                    <Envelope size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />
            </>
          )}

          {(i18n.language.toLocaleLowerCase() === 'ru') && (
            <>
              <Row className="featurette">
                <Col md={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='supported'>
                    {t('pages.landing.supported', { blockchains: '11', tokens: '9275', currencies: '161', wallets: '420' })}
                  </h2>
                  <p className="lead">
                    Мы поддерживаем 11 блокчейнов, 9275 токенов, 161 фиатную валюту и 420 крипто кошельков в качестве способов оплаты. Более подробная информация в <a href='#resources_blockchains'>Поддерживаемые блокчейны</a>, <a href='#resources_tokens'>Поддерживаемые токены</a> и <a href='#resources_currencies'>Поддерживаемые валюты</a>.
                  </p>
                </Col>
                <Col md={5} className="d-none d-md-block d-xs-block">
                  <div className='featurette-image'>
                    <CurrencyBitcoin size={100} />
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_fees'>
                    {t('pages.landing.no_fees')}
                  </h2>
                  <p className="lead">
                    Мы не берем комиссии. Комиссии могут брать только сами блокчейны за газ либо третьи сервисы, в случае конвертации токенов.
                  </p>
                </Col>
                <Col md={5} className="order-md-1 d-none d-md-block">
                  <div className='featurette-image'>
                    0%
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='no_custodial'>
                    {t('pages.landing.no_custodial')}
                  </h2>
                  <p className="lead">
                    Мы не храним ваши средства в кастодиальных кошельках в случае EVM совместимых блокчейнов. Ваши средства хранятся в смарт контракте на основе <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>стандарта ERC1155</a> и могут быть выведены на ваш кошелек. Адреса смартконтрактов можно посмотреть в <a href='#resources_contracts'>Адреса контрактов</a>.
                  </p>
                </Col>
                <Col md={5} className="d-none d-md-block">
                  <div className='featurette-image'>
                    <Wallet size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='no_integration'>
                    {t('pages.landing.no_integration')}
                  </h2>
                  <p className="lead">
                    Вам нужно просто размещать ссылки в определенном формате, чтобы принять платежи. Например, <code>{config.config?.baseUrlPayment}/000000000001/123/usd/100</code>. Ссылки могут быть созданы независимо на вашей стороне, никакой интеграции не требуется. Более подробная информация в <a href='#tutorials_receive_payments'>Как получать платежи</a>.
                  </p>
                  <p className="lead">
                    Но если вам требуется получать историю платежей вы сможете интегрироваться с нашим API. Более подробная информация в <a href='#tutorials_api'>Как интегрироваться с API</a>.
                  </p>
                  <p className="lead">
                    В дополнении вы можете настроить получение уведомлений о новых платежах. Более подробная информация в <a href='#tutorials_notifications'>Как получать уведомления о платежах</a>.
                  </p>
                </Col>
                <Col md={5} className="order-md-1 d-none d-md-block">
                  <div className='featurette-image'>
                    <Globe size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7}>
                  <h2 className="featurette-heading fw-normal lh-1" id='no_kyc'>
                    {t('pages.landing.no_kyc')}
                  </h2>
                  <p className="lead">
                    Вам не нужно проходить процедуру KYC, чтобы начать пользоваться нашим сервисом. Вам необходимо только иметь криптокошелек, с помощью которого вы сможете авторизоваться и на который вы будете выводить средства. Более подробная информация в <a href='#tutorials_create_account'>Как создать учетную запись</a> и <a href='#tutorials_withdraw'>Как выводить средства</a>.
                  </p>
                  <p className="lead">
                    Вас могут заблокировать только в том случае, если вы принимаете платежи за незаконные услуги или товары. Однако вы по-прежнему сможете напрямую взаимодействовать со смарт-контрактом, например, через <a href="https://etherscan.io/" target='_blank'>etherscan</a> и выводить все средства. Так как смарт-контракты не изменяемы и в наших смарт-контрактах нет механизма блокировки средств.
                  </p>
                </Col>
                <Col md={5} className="d-none d-md-block">
                  <div className='featurette-image'>
                    <Bank size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7} className="order-md-2">
                  <h2 className="featurette-heading fw-normal lh-1" id='auto_convert'>
                    {t('pages.landing.auto_convert')}
                  </h2>
                  <p className="lead">
                    Предположим, вы решили принимать платежи только в USDT. А ваш клиент имеет только USDC. Он все равно сможет совершить оплату. USDC будут автоматически конвертированы в USDT и отправлены вам.
                  </p>
                </Col>
                <Col md={5} className="order-md-1 d-none d-md-block">
                  <div className='featurette-image'>
                    <CurrencyExchange size={100}/>
                  </div>
                </Col>
              </Row>

              <hr className="featurette-divider" />

              <Row className="featurette">
                <Col md={7}>
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
                <Col md={5} className="d-none d-md-block">
                  <div className='featurette-image'>
                    <Envelope size={100}/>
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
