import React from 'react'

import './index.css'
import { Col, Container, Nav, NavDropdown, Navbar } from 'react-bootstrap'
import { CurrencyDollar, Envelope, FileText, Gear, GraphUpArrow, House, Wallet } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../../constants'
import { useConfig } from '../../../context/config/hook'

const Main: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <main className="d-flex flex-row">
      <Col md={3} sm={4} className="col-auto bg-dark overflow-auto vh-100 p-2">
        <Navbar bg="dark" data-bs-theme="dark" className='d-none d-sm-inline'>
          <Container>
            <Navbar.Brand href="#home">
              <span className='fs-4'>
                {import.meta.env.VITE_APP_APP_NAME ?? 'JaneDoe Finance'}
              </span>
            </Navbar.Brand>
          </Container>
        </Navbar>

        <Nav defaultActiveKey="#" className="nav-pills flex-column mb-auto w-100">
          <Nav.Link href="#home" className="text-white text-decoration-none">
            <House />
            <span className="ms-3 d-none d-sm-inline">{t('pages.app.home')}</span>
          </Nav.Link>

          <Nav.Link href="#balances" className="text-white text-decoration-none">
            <CurrencyDollar />
            <span className="ms-3 d-none d-sm-inline">{t('pages.app.balances')}</span>
          </Nav.Link>

          <Nav.Link href="#payments" className="text-white text-decoration-none">
            <GraphUpArrow />
            <span className="ms-3 d-none d-sm-inline">{t('pages.app.payments')}</span>
          </Nav.Link>

          <Nav.Item className="text-white text-decoration-none">
            <hr />
          </Nav.Item>

          <Nav.Link href="#account_settings" className="text-white text-decoration-none">
            <Gear />
            <span className="ms-3 d-none d-sm-inline">
              {t('pages.app.account_settings')}
            </span>
          </Nav.Link>

          <Nav.Link href="#payment_settings" className="text-white text-decoration-none">
            <Wallet />
            <span className="ms-3 d-none d-sm-inline">
              {t('pages.app.payment_settings')}
            </span>
          </Nav.Link>

          <Nav.Item className="text-white text-decoration-none">
            <hr />
          </Nav.Item>

          <Nav.Link href="#support" className="text-white text-decoration-none">
            <Envelope />
            <span className="ms-3 d-none d-sm-inline">
              {t('pages.app.support')}
            </span>
          </Nav.Link>

          <Nav.Link href={config.config?.baseUrlDocs} className="text-white text-decoration-none" target='_blank' active={false}>
            <FileText />
            <span className="ms-3 d-none d-sm-inline">
              {t('pages.app.documentations')}
            </span>
          </Nav.Link>
        </Nav>
      </Col>
      <Col className="overflow-auto vh-100">
        <Navbar expand="sm" className="bg-body-tertiary" sticky='top'>
          <Container fluid>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Nav>
                <NavDropdown
                  title={t('components.navbar.language', { language: i18n.resolvedLanguage?.toLocaleUpperCase() ?? 'EN' })}
                  align='end'
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <NavDropdown.Item
                      as='button'
                      key={lang}
                      active={lang === (i18n.resolvedLanguage ?? 'EN')}
                      onClick={() => i18n.changeLanguage(lang)}
                    >
                      {lang.toLocaleUpperCase()}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container fluid className="p-3">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean nec porttitor sem. Vivamus condimentum sapien ac lacus facilisis vulputate. Aenean ac auctor massa, vitae luctus est. Nullam cursus non quam eget convallis. Donec sed elit non massa accumsan ornare nec a risus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin mattis condimentum magna ac finibus. Aliquam commodo, felis et efficitur finibus, dolor dui hendrerit dui, in volutpat ipsum dui sed nunc. Etiam varius urna et scelerisque dictum. Maecenas non iaculis diam, et tristique neque. Sed tortor urna, pellentesque vel scelerisque non, consequat a nibh. Suspendisse eros tortor, rutrum sed elit sit amet, fringilla vestibulum nisi. Ut consequat malesuada risus, at vestibulum ligula pharetra eu. Etiam vitae justo ut tellus vestibulum tincidunt. Sed iaculis enim eu sapien congue, non eleifend libero consectetur.
          </p>
          <p>
            In ut lacinia urna, ac tincidunt metus. Nam ut congue velit, id hendrerit quam. Aenean placerat tempus ultrices. Proin cursus sit amet metus ac elementum. Praesent id elit sed justo laoreet semper. Vestibulum venenatis sagittis nunc, et tempor lacus vestibulum a. Aliquam vestibulum sit amet tortor convallis fringilla. Maecenas vel metus et sapien lobortis volutpat. Morbi vestibulum massa at ipsum accumsan, non placerat risus accumsan. Sed pharetra faucibus massa at euismod.
          </p>
          <p>
            Duis pretium enim sit amet venenatis faucibus. Donec posuere, turpis quis sollicitudin volutpat, sem augue sodales nunc, ut auctor dolor justo sed mi. Vivamus placerat, justo a porta ullamcorper, augue justo lobortis mi, non consequat velit urna et tortor. Ut eget blandit ligula. Mauris commodo, justo eget commodo gravida, lacus turpis ornare lacus, vel placerat nulla erat quis neque. Nam quis lacus sit amet urna volutpat iaculis eget vehicula justo. Etiam lacinia nec justo nec lacinia. Maecenas ut sem neque. Aliquam blandit lectus eget lacus porta porttitor. Cras condimentum libero eu rhoncus ornare. Ut et tortor erat.
          </p>
          <p>
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis semper congue orci venenatis egestas. Nam in iaculis nunc, vitae mattis velit. Curabitur eu diam purus. Ut massa magna, porta ac sollicitudin semper, pulvinar et neque. Praesent ac commodo neque, vitae vestibulum sem. Morbi euismod, tellus eu cursus finibus, ante libero auctor nisi, non iaculis eros odio a nibh. Vestibulum sapien lacus, varius sit amet augue at, posuere placerat turpis.
          </p>
          <p>
            Nam nec ipsum vehicula, aliquet diam nec, iaculis nisi. Cras vitae tristique lacus, at tincidunt odio. Mauris luctus, risus sit amet ullamcorper semper, turpis mauris sollicitudin odio, nec consequat sem dolor id sem. Nullam eros urna, porttitor a semper non, feugiat ac dolor. Proin vitae erat in quam aliquam mattis. Aliquam sed posuere eros. Nunc malesuada lacinia est, non laoreet turpis faucibus a. Sed sit amet eros massa. Sed ut arcu aliquam, sollicitudin nibh non, rutrum metus. Cras mauris lectus, semper ac risus vestibulum, finibus lobortis est. Aenean massa turpis, sollicitudin eget sollicitudin ultrices, varius aliquet ante. Fusce vitae vestibulum augue.
          </p>
        </Container>
      </Col>
    </main>
  )
}
export default Main
