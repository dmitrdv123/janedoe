import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const Refund: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_refund_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            Let's make a payment refund. Open the page <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">Payment History</a> page. You will see <code>Refund</code> button at the last column for each of incoming payment.
          </p>
          <p>
            <Image src='../locales/en/img/refund_payment_1.png' fluid />
          </p>
          <p>
            Click on it. Page <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">Payment</a> will be opened with certain blockchain, amount, destination address. In comment you will see text that allow you to identify this outgoing payment as refund payment.
          </p>
          <p>
            <Image src='../locales/en/img/refund_payment_2.png' fluid />
          </p>
          <p>
            If necessary, change the refund amount, e.g. reduce it by the amount of expenses you incurred. Note that in the case of Bitcoin, the sent amount will be automatically reduced by the gas fee. You can also choose a different blockchain and token to make the refund.
          </p>
          <p>
            Click on the <code>Pay</code> button to make an refund payment. Approve the transaction in your wallet. And if it is successful, you will see an informational message with the transaction ID at the top of the page. You can click on it to see the details in the blockchain explorer.
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            Давайте совершим возврат платежа. Откройте страницу <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">История платежей</a>. Вы увидите кнопку <code>Возврат</code> в последней колонке для каждого входящего платежа.
          </p>
          <p>
            <Image src='../locales/ru/img/refund_payment_1.png' fluid />
          </p>
          <p>
            Нажмите на нее. Будет открыта страница <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">Платежи</a> с необходимым блокчейном, токеном, суммой и адресом. В комментарии вы увидите текст, который позволит вам идентифицировать этот исходящий платеж как  возврат платежа.
          </p>
          <p>
            <Image src='../locales/en/img/refund_payment_2.png' fluid />
          </p>
          <p>
            При необходимости измените сумму возврата, например, уменьшите ее на величину затрат, которые вы понесли. Обратите внимание, что в случае с Bitcoin отправленная сумма будет автоматически уменьшена на величину комиссии за газ. Также вы можете выбрать другой блокчейн и токен для осуществления возврата платежа.
          </p>
          <p>
            Нажмите на кнопку <code>Оплатить</code>, чтобы совершить возврат платежа. Одобрите транзакцию в своем кошельке. И если все пройдет успешно, в верхней части страницы вы увидите информационное сообщение с идентификатором транзакции. Вы можете нажать на него, чтобы увидеть подробности в проводнике блокчейна.
          </p>
        </>
      )}
    </>
  )
}

export default Refund
