import { Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import LanguageDropdown from '../components/LanguageDropdown'
import WalletDropdown from '../components/WalletDropdown'
import { useConfig } from '../../../context/config/hook'

const AuthNavbar: React.FC = () => {
  const { address } = useAccount()
  const { t } = useTranslation()
  const config = useConfig()

  return (
    <Navbar expand="sm" className="bg-body-tertiary" sticky='top'>
      <Container fluid>
        <Navbar.Brand href="/">
          <span className='fs-4'>
            {import.meta.env.VITE_APP_APP_NAME ?? 'Jane Doe'}
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Nav.Link href={config.config?.baseUrlSupport} target="_blank">
              {t('components.navbar.support')}
            </Nav.Link>
            <LanguageDropdown />
            {address && (
              <WalletDropdown address={address} />
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AuthNavbar
