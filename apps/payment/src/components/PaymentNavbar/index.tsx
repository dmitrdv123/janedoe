import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'

import { cutString } from '../../libs/utils'
import { SUPPORTED_LANGUAGES } from '../../constants'
import { useConfig } from '../../context/config/hook'

const PaymentNavbar: React.FC = () => {
  const { address, status } = useAccount()
  const { disconnect } = useDisconnect()
  const { t, i18n } = useTranslation()

  const { id, paymentId } = useParams()
  const config = useConfig()

  return (
    <>
      <Navbar expand="sm" className="bg-body-tertiary" sticky='top'>
        <Container fluid>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Nav.Link href={`${config.config?.baseUrlSupport}?type=payment&id=${id ?? ''}&paymentId=${paymentId ?? ''}&from=${address ?? ''}`} target='_blank'>{t('components.payment_navbar.support')}</Nav.Link>
              <NavDropdown
                title={t('components.payment_navbar.language', { language: i18n.resolvedLanguage?.toLocaleUpperCase() ?? 'EN' })}
                align='end'
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <NavDropdown.Item
                    as='button'
                    key={lang}
                    active={lang === (i18n.resolvedLanguage ?? 'EN')}
                    onClick={() => i18n.changeLanguage(lang)}
                  >
                    {lang.toLocaleUpperCase()}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>

              {(status === 'connected' && address) && (
                <NavDropdown
                  title={t('components.payment_navbar.connected_in', { address: cutString(address.toString()) })}
                  align='end'
                >
                  <NavDropdown.Header>
                    {address}
                  </NavDropdown.Header>
                  <NavDropdown.Item as='button' onClick={() => disconnect()}>
                    {t('components.payment_navbar.disconnect')}
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default PaymentNavbar
