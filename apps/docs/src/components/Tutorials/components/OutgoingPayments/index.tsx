import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const OutgoingPayments: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_monitor_outgoing_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            Let's make an outgoing payment. Open the page <a href={`${config.config?.baseUrlAccount}/payment`} target="_blank">Payment</a> page.
          </p>
          <p>
            <Image src='../locales/en/img/outgoing_payment_1.png' fluid />
          </p>
          <p>
            You must select a blockchain, token, amount (either in number of tokens or currency), destination address, and optionally a comment. You can refresh the balance of the selected token by clicking the <code>Refresh Balance</code> link below the token dropdown.
          </p>
          <p>
            Click on the <code>Pay</code> button to make an outgoing payment. Approve the transaction in your wallet. And if it is successful, you will see an informational message with the transaction ID at the top of the page. You can click on it to see the details in the blockchain explorer.
          </p>
          <p>
            <Image src='../locales/en/img/outgoing_payment_2.png' fluid />
          </p>
          <p>
            Note that in the case of Bitcoin, the sent amount will be automatically reduced by the gas fee.
          </p>
          <p>
            Outgoing payments can be seen on <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">Payments History</a> page. You can see <code>Direction = Ougoing</code> at the column <code>Details</code> and comment that you set at the column <code>Payment</code>.
          </p>
          <p>
            <Image src='../locales/en/img/outgoing_payment_3.png' fluid />
          </p>
          <p>
            In case of Bitcoin you will see up to 4 records for each outgoing payment on <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">Payments History</a> page:
            <ul>
              <li>
                The outgoing payment you made with <code>amount = amount - gas</code>.
              </li>
              <li>
                Outgoing payment for gas. It has <code>_gas</code> in the Payment ID value and <code>To: 0x0</code>.
              </li>
              <li>
                Outgoing payment of the remaining amount of spent UTXO to your special address for such cases.
              </li>
              <li>
                Incoming payment of the remaining amount of spent UTXO to your special address. It has <code>Payment ID = your Account ID</code>.
              </li>
            </ul>
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            Давайте совершим исходящий платеж. Откройте страницу <a href={`${config.config?.baseUrlAccount}/payment`} target="_blank">Платежи</a>.
          </p>
          <p>
            <Image src='../locales/ru/img/outgoing_payment_1.png' fluid />
          </p>
          <p>
            Вы должны выбрать блокчейн, токен, сумму (либо в количестве токенов, либо в валюте), адрес назначения и, по желанию, комментарий. Вы можете обновить баланс выбранного токена, нажав на ссылку <code>Refresh Balance</code> под выпадающим списком токенов.
          </p>
          <p>
            Нажмите на кнопку <code>Pay</code>, чтобы совершить исходящий платеж. Одобрите транзакцию в своем кошельке. И если все пройдет успешно, в верхней части страницы вы увидите информационное сообщение с идентификатором транзакции. Вы можете нажать на него, чтобы увидеть подробности в проводнике блокчейна.
          </p>
          <p>
            <Image src='../locales/ru/img/outgoing_payment_2.png' fluid />
          </p>
          <p>
            Обратите внимание, что в случае с Bitcoin отправленная сумма будет автоматически уменьшена на величину комиссии за газ.
          </p>
          <p>
            Исходящие платежи можно увидеть на странице <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">История платежей</a>. Вы можете увидеть <code>Направление = исходящий</code> в колонке <code>Детали</code> и комментарий, который вы установили, в колонке <code>Платеж</code>.
          </p>
          <p>
            <Image src='../locales/ru/img/outgoing_payment_3.png' fluid />
          </p>
          <p>
            В случае Bitcoin вы увидете до 4 записей на каждый исходящий платеж на странице <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">История платежей</a>:
            <ul>
              <li>
                Исходящий платеж, который вы совершили, с <code>сумма = сумма - плата за газ</code>.
              </li>
              <li>
                Исходящий платеж за газ. Он имеет <code>_gas</code> в значении Идентификатор платежа и <code>Кому: 0x0</code>.
              </li>
              <li>
                Исходящий платеж оставшейся суммы потраченного UTXO на ваш специальный адрес для таких случаев.
              </li>
              <li>
                Входящий платеж оставшейся суммы потраченного UTXO на ваш специальный адрес. Он имеет <code>Идентификатор платежа = идентификатор вашего аккаунта</code>.
              </li>
            </ul>
          </p>
        </>
      )}
    </>
  )
}

export default OutgoingPayments
