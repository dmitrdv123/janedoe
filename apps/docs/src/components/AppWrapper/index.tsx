import React, { useCallback } from 'react'
import { Alert, Col, Container } from 'react-bootstrap'

import './index.css'

import SettingsLoader from '../../states/settings/loader'
import { ApplicationPage } from '../../types/page'
import DocSidebar from '../DocSidebar'
import MetaLoader from '../../states/meta/loader'
import DocNavbar from '../DocNavbar'
import { useInfoMessages } from '../../states/application/hook'

interface AppWrapperProps {
  page: ApplicationPage
  element: React.ReactElement
}

const AppWrapper: React.FC<AppWrapperProps> = (props) => {
  const { page, element } = props

  const { infoMessages, removeInfoMessage } = useInfoMessages()

  const getInfoMessages = useCallback(() => {
    return [...infoMessages]
      .reverse()
      .map(item => {
        return (
          <Alert
            key={item.key}
            variant={item.variant ?? 'info'}
            onClose={() => removeInfoMessage(item.key)}
            dismissible
          >
            {item.content}
          </Alert>
        )
      })
  }, [infoMessages, removeInfoMessage])

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
            {getInfoMessages()}
            {element}
          </Container>
        </Col>
      </main>
    </>
  )
}

export default AppWrapper
