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
                    <a href="#" className="text-decoration-none">ETH USDT</a> будет cконвертирован
                  </div>
                  <div>
                    <Button variant="link" className="text-decoration-none" size='sm'>
                      Обновить
                    </Button>
                  </div>
                </div>

                <div>
                  <Row>
                    <Col sm={6}>
                      <Form.Group as={Row}>
                        <Form.Label column sm={4}>
                          в токен
                        </Form.Label>
                        <Col sm={8}>
                          <Form.Control as="button" className="dropdown-toggle" >
                            ETH
                          </Form.Control>
                        </Col>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group as={Row}>
                        <Form.Label column sm={8}>с проскальзыванием</Form.Label>
                        <Col sm={4}>
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
                  <div>Суммарная комиссия: 0.32 USD</div>
                  <div>Суммарное время: 2 мин</div>
                </div>

                <div>Конвертация:</div>
                <ListGroup numbered>
                  <ListGroup.Item className="border-0">
                    <a href="#" className="text-decoration-none">BNB</a> в <a href="#" className="text-decoration-none">USDT</a> (<a href="#" className="text-decoration-none">Pancake V3</a>)
                    <div>
                      Комиссия: 0.16 USD
                    </div>
                    <div>
                      Время: 1 мин
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    <a href="#" className="text-decoration-none">USDT</a> в <a href="#" className="text-decoration-none">USDC</a> (<a href="#" className="text-decoration-none">Paraswap</a>)
                    <div>
                      Комиссия: 0.16 USD
                    </div>
                    <div>
                      Время: 1 мин
                    </div>
                  </ListGroup.Item>
                </ListGroup>
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
      </main>
    </>
  )
}

export default PaymentEvm
