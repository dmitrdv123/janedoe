import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const ReceivePayments: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_receive_payments_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            To accept payments, you simply need to place payment links in a specific format on your website. Your user will be taken to the payment form by clicking on it. Instructions for creating such links and an example can be found on the main page <a href={`${config.config?.baseUrlAccount}/app`} target="_blank">JaneDoe</a>.
          </p>
          <p>
            <Image src='../locales/en/img/receive_payment_1.png' fluid />
          </p>

          <p>
            Link format:<br />
            <code>http://{config.config?.baseUrlPayment}/your account ID/payment ID/currency/amount</code>
          </p>
          <ul>
            <li>
              Account ID - you can get it on the main page <a href={`${config.config?.baseUrlAccount}/app`} target="_blank">JaneDoe</a>.
            </li>
            <li>
              Payment ID - generate any unique identifier that will be used by you to identify the payment. It can consist of alphabetic symbols, numbers, '_' and '-' and be no more than 50 characters long.
            </li>
            <li>
              Currency - symbolic of the fiat currency, for example, USD or EUR.
            </li>
            <li>
              Amount - payment amount in fiat currency..
            </li>
          </ul>

          <p>
            Link example:<br />
            <code>{`${config.config?.baseUrlPayment}/000000000001/d57cf701-ba20-42a0-97b9-a964366809c8/usd/100`}</code>
          </p>
          <p>
            In the example above:
          </p>
          <ul>
            <li>
              2f4m14ec0k3 - account ID. Please note that your account ID will be different.
            </li>
            <li>
              d57cf701-ba20-42a0-97b9-a964366809c8 - payment ID
            </li>
            <li>
              usd - payment currency
            </li>
            <li>
              100 - payment amount. Please note that you need to check that this payment has received the amount you expect. Because the payment amount is passed in the URL parameters and is not recorded anywhere else.
            </li>
          </ul>
          <p>
            Optionally, you can set custom text that the user will see when paying. To do this, go to the page <a href={`${config.config?.baseUrlAccount}/account_settings`} target="_blank">Account Settings</a>, in the <code>Company Description</code> field enter the text and click on the button <code>Save</code>.
          </p>
          <p>
            <Image src='../locales/en/img/receive_payment_2.png' fluid />
          </p>
          <p>
            The payment form will start contain this text.
          </p>
          <p>
            <Image src='../locales/en/img/receive_payment_3.png' fluid />
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            Чтобы принимать платежи вам просто необходимо разместить ссылки для оплаты в определенном формате на вашем сайте. Ваш пользователь будет перенаправлен на форму оплаты, нажав на нее. Инструкцию как создавать такие ссылки и пример вы найдете на главной странице <a href={`${config.config?.baseUrlAccount}/app`} target="_blank">JaneDoe</a>.
          </p>
          <Image src='../locales/ru/img/receive_payment_1.png' fluid />

          <p>
            Формат ссылки:<br />
            <code>http://{config.config?.baseUrlPayment}/идентификатор вашего аккаунта/идентификатор платежа/валюта/сумма</code>
          </p>
          <ul>
            <li>
              Идентификатор вашего аккаунта - вы можете взять его на главной странице <a href={`${config.config?.baseUrlAccount}/app`} target="_blank">JaneDoe</a>.
            </li>
            <li>
              Идентификатор платежа - сгенерируйте любой уникальный идентификатор, который будет использоваться вами для идентификации платежа. Он может состоять из буквенных символов, цифр, '_' и '-' и быть длиной не более 50 символов.
            </li>
            <li>
              Валюта - символ фиатной валюты, например, USD или EUR.
            </li>
            <li>
              Сумма - сумма платежа в фиатной валюте.
            </li>
          </ul>

          <p>
            Пример ссылки:<br />
            <code>{`${config.config?.baseUrlPayment}/000000000001/d57cf701-ba20-42a0-97b9-a964366809c8/usd/100`}</code>
          </p>
          <p>
            В примере выше:
          </p>
          <ul>
            <li>
              2f4m14ec0k3 - идентификатор аккаунта. Обратите внимание, что ваш идентификатор аккаунта будет другим.
            </li>
            <li>
              d57cf701-ba20-42a0-97b9-a964366809c8 - идентификатор платежа
            </li>
            <li>
              usd - валюта платежа
            </li>
            <li>
              100 - сумма платежа. Обратите внимание, что вам необходимо проверять, что по данному платежу пришла сумма, которую вы ожидаете. Потому что сумма платежа передается в параметрах URL и нигде больше не фиксируется.
            </li>
          </ul>

          <p>
            Опционально, вы можете задать произвольный текст, который увидит пользователь при оплате. Для этого перейдите на страницу <a href={`${config.config?.baseUrlAccount}/account_settings`} target="_blank">Настройки аккаунта</a>, в поле <code>Описание компании</code> введите текст и нажмите на кнопку <code>Сохранить</code>.
          </p>
          <Image src='../locales/ru/img/receive_payment_2.png' fluid />
          <p>
            Форма оплаты начнет содержать этот текст.
          </p>
          <Image src='../locales/ru/img/receive_payment_3.png' fluid />
        </>
      )}
    </>
  )
}

export default ReceivePayments
