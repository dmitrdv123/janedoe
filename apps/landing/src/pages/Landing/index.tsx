import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'

import './index.css'

import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LandingNavbar from '../../components/navbars/LendingNavbar'
import { useConfig } from '../../context/config/hook'
import { MAILTO } from '../../constants'

const Landing: React.FC = () => {
  const { t } = useTranslation()
  const { hash } = useLocation()

  const config = useConfig()

  const contact = 'janedoeboss'
  const domain = 'proton.me'

  return (
    <div className="d-flex flex-column min-vh-100">
      <LandingNavbar />

      <main className="flex-grow-1 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className='text-center mx-auto'>
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
                <li>{t('pages.landing.no_kyc')}</li>
                <li>{t('pages.landing.no_fees')}</li>
                <li>{t('pages.landing.no_custodial')}</li>
                <li>{t('pages.landing.no_integration')}</li>
                <li>{t('pages.landing.supported', { blockchains: '11', tokens: '9275', currencies: '161' })}</li>
                <li>{t('pages.landing.auto_convert')}</li>
              </ul>
              <a href={config.config?.baseUrlDocs} target='_blank'>
                {t('pages.landing.read_more')}
              </a>
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="mt-auto py-3">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">
                {t('pages.landing.contact')}
                <a target="_blank" rel="noopener noreferrer" className='ms-2' href={`${MAILTO}:${contact}@${domain}`}>
                  <span>{contact}</span>
                  <span>@</span>
                  <span>{domain}</span>
                </a>
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div >
  )
}

export default Landing
