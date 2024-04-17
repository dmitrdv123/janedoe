import { Container, Nav, Navbar } from 'react-bootstrap'

import LanguageDropdown from './components/LanguageDropdown'

const AuthNavbar: React.FC = () => {
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
            <LanguageDropdown />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AuthNavbar
