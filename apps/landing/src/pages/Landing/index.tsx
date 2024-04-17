import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'

import './index.css'

import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LandingNavbar from '../../components/navbars/LendingNavbar'
import { useConfig } from '../../context/config/hook'

const Landing: React.FC = () => {
  const { t } = useTranslation()
  const { hash } = useLocation()

  const config = useConfig()

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
                <li>{t('pages.landing.supported', { blockchains: 'N', tokens: 'M', currencies: 'K' })}</li>
                <li>{t('pages.landing.auto_convert')}</li>
              </ul>
              <a href={config.config?.baseUrlDocs} target='_blank'>
                {t('pages.landing.read_more')}
              </a>
            </Col>
          </Row>
        </Container>
      </main>
    </div >
  )
}

export default Landing
