import React from 'react'
import { Col, Container } from 'react-bootstrap'

import './index.css'

import SettingsLoader from '../../states/settings/loader'
import { ApplicationPage } from '../../types/page'
import MetaLoader from '../../states/meta/loader'
import DocSidebar from '../../components/DocSidebar'
import DocNavbar from '../../components/DocNavbar'
import InfoMessages from '../../components/InfoMessages'

interface AppProps {
  page: ApplicationPage
  element: React.ReactElement
}

const App: React.FC<AppProps> = (props) => {
  const { page, element } = props

  return (
    <>
      <SettingsLoader />
      <MetaLoader />

      <main className="d-flex flex-row">
        <Col lg={3} md={4} className="col-auto bg-dark overflow-auto vh-100 p-2">
          <DocSidebar page={page}/>
        </Col>

        <Col className="overflow-auto vh-100">
          <DocNavbar />

          <Container fluid className="p-3">
            <InfoMessages />
            {element}
          </Container>
        </Col>
      </main>
    </>
  )
}

export default App
