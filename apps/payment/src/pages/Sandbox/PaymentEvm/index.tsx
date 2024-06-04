import React from 'react'
import { Button, Card, Col, Container, Dropdown, Form, ListGroup, Row } from 'react-bootstrap'

import './index.css'

import PaymentNavbar from '../../../components/PaymentNavbar'

const PaymentEvm: React.FC = () => {
  return (
    <>
      <PaymentNavbar />

      <main>
        <Container className="payment-container">
          <div className='mb-2 mt-2'>
            <h2>
              <strong>
                720 руб
              </strong>
            </h2>
            <div>ИД компании: 606b7e5e4e90</div>
            <div>ИД заказа: 606b7e5e4e90</div>
            <div>ИП Добряк Дмитрий Вадимович</div>
          </div>

          <Form>
            <Form.Group className="mb-2">
              <Form.Control as="button" className="dropdown-toggle">
                Ethereum
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Control as="button" className="dropdown-toggle">
                ETH
              </Form.Control>
              <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                Не хватает баланса
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Баланс: 14267 USDT (= 0.00 USD)
              </Form.Text>
            </Form.Group>

            <Card className="mb-2">
              <Card.Header className='p-2'>
                <div className="d-flex justify-content-between">
                  <div>
                    USDT будет cконвертирован
                  </div>
                  <div>
                    <Button variant="link" className="text-decoration-none" size='sm'>
                      Обновить
                    </Button>
                  </div>
                </div>

                <div>
                  <Row>
                    <Col xs="auto">
                      <Form.Group as={Row}>
                        <Form.Label column xs="auto">
                          в токен
                        </Form.Label>
                        <Col xs="auto">
                          <Button className="dropdown-toggle" variant="outline-link">
                            ETH
                          </Button>
                        </Col>
                      </Form.Group>
                    </Col>
                    <Col xs="auto">
                      <Form.Group as={Row}>
                        <Form.Label column xs="auto">с проскальзыванием</Form.Label>
                        <Col xs="auto">
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-link">
                              1%
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Col>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <div className="text-muted">
                  магазин не принимает USDT в качестве оплаты
                </div>
              </Card.Header>
              <Card.Body className='p-2'>
                <div className="mb-2">
                  <div>Входящая сумма 0.0001 ETH (0.5 USD)</div>
                  <div>Выходящая сумма 0.0005 USDT (0.5 USD)</div>
                  <div>Суммарное время: 2 мин</div>
                </div>

                <div className="mb-2">
                  Комиссии:
                  <ListGroup as="ol" numbered>
                    <ListGroup.Item as="li" className="border-0 pt-0 pb-0">
                      Rango Fee 0.000000201131252603 ETH(= 0.00 USD)
                    </ListGroup.Item>
                    <ListGroup.Item as="li" className="border-0 pt-0 pb-0">
                      Network Fee 0.0000258656 ETH(= 0.10 USD)
                    </ListGroup.Item>
                  </ListGroup>
                </div>

                <div className="mb-2">
                  Конвертация:
                  <ListGroup as="ol" numbered>
                    <ListGroup.Item as="li" className="border-0 pt-0 pb-0">
                      UniSwapV3: ETH в <a href="#" className="text-decoration-none">USDC</a>
                    </ListGroup.Item>
                  </ListGroup>
                </div>
              </Card.Body>
            </Card>

            <Form.Group className="mb-2" controlId="formBasicEmail">
              <Form.Control type="email" placeholder="Enter email" />
              <Form.Text className="text-muted">
                для отправки информации о платеже
              </Form.Text>
            </Form.Group>

            <div className="d-grid mb-2">
              <Button variant="primary" size="lg">
                Оплатить 0.004500373080928409 ETH
                <br />
                (= 0.00 USD)
              </Button>
            </div>

            <Card>
              <Card.Body className='p-2'>
                <div>Сумма: 5 USD</div>
                <div>Комиссии: 1 USD</div>
                <div>Время: 2 мин</div>
              </Card.Body>
            </Card>
          </Form>

          <div className="d-flex align-items-center justify-content-center">
            <p className="mb-0">Цены токенов обновятся через: 599 секунд</p>
            <Button variant="link">Обновить</Button>
          </div>
        </Container>
      </main >
    </>
  )
}

export default PaymentEvm
