import React from 'react'
import { Spinner } from 'react-bootstrap'

const Loader: React.FC = () => {
  return (
    <>
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        Loading...
      </div>
    </>
  )
}

export default Loader
