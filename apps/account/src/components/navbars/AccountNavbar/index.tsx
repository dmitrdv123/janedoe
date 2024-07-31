import { Container, Nav, Navbar } from 'react-bootstrap'
import { useAccount } from 'wagmi'

import AccountsDropdown from '../components/AccountsDropdown'
import LanguageDropdown from '../components/LanguageDropdown'
import WalletDropdown from '../components/WalletDropdown'

const AccountNavbar: React.FC = () => {
  const { address, status } = useAccount()

  return (
    <Navbar expand="md" className="bg-body-tertiary" sticky='top'>
      <Container fluid>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <LanguageDropdown />
            <AccountsDropdown />
            {(status === 'connected' && address) && (
              <WalletDropdown address={address} />
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AccountNavbar
