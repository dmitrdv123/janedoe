import { Container, Nav, Navbar } from 'react-bootstrap'
import { useAccount } from 'wagmi'

import LanguageDropdown from '../components/LanguageDropdown'
import WalletDropdown from '../components/WalletDropdown'
import LogoutButton from '../components/LogoutButton'

const AccountNavbar: React.FC = () => {
  const { address, isConnected } = useAccount()

  return (
    <Navbar expand="md" className="bg-body-tertiary" sticky='top'>
      <Container fluid>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <LanguageDropdown />
            {(isConnected && address) && (
              <WalletDropdown address={address} />
            )}
            <LogoutButton />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AccountNavbar
