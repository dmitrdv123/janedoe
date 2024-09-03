import React from 'react'
import { useTranslation } from 'react-i18next'

import './index.css'

import LandingNavbar from '../../components/navbars/LendingNavbar'
import Blogs from '../../components/Blogs'

const Blog: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="d-flex flex-column min-vh-100">
      <LandingNavbar />

      <main>
        <Blogs />

        <footer className="container">
          <p className="float-end"><a href="#">{t('pages.blog.to_top')}</a></p>
          <p>© 2024 JaneDoe</p>
        </footer>
      </main>

    </div >
  )
}

export default Blog
