import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const Notifications: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_notifications_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            In order to receive notifications about payments, you need to set <code>Notification Settings</code>. Open the <a href={`${config.config?.baseUrlAccount}/account_settings`} target="_blank">Account Settings</a> page and find the <code>Notification Settings</code> section. Specify <code>Payment Callback</code> and <code>Secret Key</code> (optionally). Click on button <code>Save</code>.
          </p>
          <p>
            <Image src='../locales/en/img/notification_settings_1.png' fluid />
          </p>
          <p>
            You will start receiving payment notifications to the specified URL in the following format:
          </p>
          <ul>
            <li>
              HTTP method - POST
            </li>
            <li>
              Headers:
              <ul>
                <li>Content-Type: application/json;charset=UTF-8</li>
                <li>Accept: application/json</li>
                <li>Authorization': Bearer <code>Secret Key</code></li>
              </ul>
            </li>
            <li>
              Body:
<pre>
  {`{
    "accountId": "string",
    "paymentId": "string",

    "block": "string",
    "timestamp": "number",
    "transaction": "string",
    "index": "number",

    "from": "string | null",
    "to": "string",
    "direction": "incoming | outgoing",
    "amount": "string",
    "amountUsd": "number | null",
    "amountCurrency": "number | null",

    "totalAmountUsd": "number | null",
    "totalAmountCurrency": "number | null",

    "blockchain": "string",
    "tokenAddress": "string | null",
    "tokenSymbol": "string | null",
    "tokenDecimals": "number | null",
    "tokenUsdPrice": "number | null",

    "currency": "string | null",
    "currencyExchangeRate": "number | null"
  }`}
</pre>
            </li>
          </ul>
          <p>
            You can view the sending results on the <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">Payment History</a> page in the <code>Notification</code> column.
          </p>
          <p>
            <Image src='../locales/en/img/notification_settings_2.png' fluid />
          </p>
          <p>
            You will be able to resend the notification. To do this, click on the cell in the <code>Notification</code> column. A modal window will open. By clicking on the <code>Send notification</code> button you will send it again.
          </p>
          <p>
            <Image src='../locales/en/img/notification_settings_3.png' fluid />
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
        <p>
          Для того чтобы получать уведомления о платежах вам необходимо задать <code>Настройки уведомлений</code>. Откройте страницу <a href={`${config.config?.baseUrlAccount}/account_settings`} target="_blank">Настройки аккаунта</a> и найдите раздел <code>Настройки уведомлений</code>. Укажите <code>Callback URL для платежа</code> и <code>Секретный ключ</code> (опционально). Нажмите на кнопку <code>Сохранить</code>.
        </p>
        <p>
          <Image src='../locales/ru/img/notification_settings_1.png' fluid />
        </p>
        <p>
          Вы начнете получать уведомления о платежах на указанный URL в следующем формате:
        </p>
        <ul>
          <li>
            HTTP метод - POST
          </li>
          <li>
            Headers:
            <ul>
              <li>Content-Type: application/json;charset=UTF-8</li>
              <li>Accept: application/json</li>
              <li>Authorization': Bearer <code>Секретный ключ</code></li>
            </ul>
          </li>
          <li>
            Body:
<pre>
{`{
  "accountId": "string",
  "paymentId": "string",

  "block": "string",
  "timestamp": "number",
  "transaction": "string",
  "index": "number",

  "from": "string | null",
  "to": "string",
  "direction": "incoming | outgoing",
  "amount": "string",
  "amountUsd": "number | null",
  "amountCurrency": "number | null",

  "totalAmountUsd": "number | null",
  "totalAmountCurrency": "number | null",

  "blockchain": "string",
  "tokenAddress": "string | null",
  "tokenSymbol": "string | null",
  "tokenDecimals": "number | null",
  "tokenUsdPrice": "number | null",

  "currency": "string | null",
  "currencyExchangeRate": "number | null"
}`}
</pre>
          </li>
        </ul>
        <p>
          Вы сможете посмотреть результаты отправки на странице <a href={`${config.config?.baseUrlAccount}/payments`} target="_blank">История платежей</a> в колонке <code>Уведомление</code>.
        </p>
        <p>
          <Image src='../locales/ru/img/notification_settings_2.png' fluid />
        </p>
        <p>
          Вы сможете отправить уведомление повторно. Для этого кликните мышкой на ячейке в колонке <code>Уведомление</code>. Вам откроется модальное окно. Нажав на кнопку <code>Отправить уведомление</code> вы отправите его еще раз.
        </p>
        <p>
          <Image src='../locales/ru/img/notification_settings_3.png' fluid />
        </p>
      </>
      )}
    </>
  )
}

export default Notifications
