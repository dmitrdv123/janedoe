import { Alert, Col, Container, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import './index.css'

import PaymentNavbar from '../../components/PaymentNavbar'

const NotFound: React.FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <PaymentNavbar />

      <main>
        <Container>
          <Row>
            <Col>
              <h2>
                {t('pages.not_found.title')}
              </h2>

              <Alert variant="danger">
                {t('pages.not_found.description')}
              </Alert>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}

export default NotFound
