import React from 'react'
import { Button, Col, Container, Nav, Navbar, Row } from 'react-bootstrap'

import './index.css'
import LanguageDropdown from '../../../components/navbars/components/LanguageDropdown'

const Landing: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar expand="sm">
        <Container fluid>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <LanguageDropdown />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className='text-center mx-auto'>
              <h1 className="fw-light">JaneDoe</h1>
              <p className="lead text-body-secondary">Accept cryptocurrency payments</p>
              <p>
                <Button variant="primary" className="btn-lg">Sign In or Sign Up</Button>
              </p>
            </Col>
            <Col md={4}>
              <ul className="list-unstyled text-body-secondary">
                <li>No KYC</li>
                <li>No fees</li>
                <li>No custodial wallets</li>
                <li>No integration required</li>
                <li>N blockchains, M tokens and K currencies</li>
                <li>Automatic token conversion</li>
              </ul>
              <a href="#">Read more in documentation</a>
            </Col>
          </Row>
        </Container>
      </main>
    </div >
  )
}

export default Landing
