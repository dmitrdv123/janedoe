import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const MonitorPayments: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_monitor_payments_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            Let's make the payment. Open the main page <a href={`${config.config?.baseUrlAccount}/#home`} target="_blank">JaneDoe</a> and follow the example link provided there
          </p>
          <p>
            <Image src='locales/en/img/monitor_payment_1.png' fluid />
          </p>
          <p>
            A payment form will be opened. Make a payment.
          </p>
          <p>
            <Image src='locales/en/img/monitor_payment_2.png' fluid />
          </p>
          <p>
            Return to the admin UI to the <a href={`${config.config?.baseUrlAccount}/#payments`} target="_blank">Payments</a> page. You will be able to see this payment with amount in cryptocurrency, in fiat currency at the payment time and at the current moment. Please note that you need to check that this payment has received the amount you expect. Because the payment amount is passed in the URL parameters and is not recorded anywhere else.
          </p>
          <p>
            <Image src='locales/en/img/monitor_payment_3.png' fluid />
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            Давайте совершим платеж. Откройте главную страницу <a href={`${config.config?.baseUrlAccount}/#home`} target="_blank">JaneDoe</a> и перейдите по указанной там ссылке примеру
          </p>
          <p>
            <Image src='locales/ru/img/monitor_payment_1.png' fluid />
          </p>
          <p>
            Откроется форма для платежа. Совершите платеж.
          </p>
          <p>
            <Image src='locales/ru/img/monitor_payment_2.png' fluid />
          </p>
          <p>
            Вернитесь в интерфейс администратора на страницу <a href={`${config.config?.baseUrlAccount}/#payments`} target="_blank">Платежи</a>. Вы сможете увидеть этот платеж с суммой в криптовалюте, в фиатной валюте на момент платежа и на текущий момент. Обратите внимание, что вам необходимо проверять, что по данному платежу пришла сумма, которую вы ожидаете. Потому что сумма платежа передается в параметрах URL и нигде больше не фиксируется.
          </p>
          <p>
            <Image src='locales/ru/img/monitor_payment_3.png' fluid />
          </p>
        </>
      )}
    </>
  )
}

export default MonitorPayments
