import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const PaymentSettings: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_payment_settings_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            You can specify the blockchains and tokens in which you are directly ready to accept payments on the page <a href={`${config.config?.baseUrlAccount}/#payment_settings`} target="_blank">Payment Settings</a>. Users will still be able to make payments in other blockchains and tokens, but the tokens will be converted to the ones you specify.
          </p>
          <p>
            Example:<br />
            You are ready to accept Bitcoins and USDT stablecoins on Ethereum blockchain and your settings are following:
          </p>
          <p>
            <Image src='../locales/en/img/payment_settings_1.png' fluid />
          </p>
          <p>
            The user opens the payment form and selects blockchain Ethereum and token ETH. The token are not included in Payment settings.
          </p>
          <p>
            <Image src='../locales/en/img/payment_settings_2.png' fluid />
          </p>
          <p>
            As you can see, the payment form will tell him that his token will be converted into USDT on Ethereum and sent to the shop. It means, that you will receive not volatile ETH, but stablecoins USDT.
          </p>
          <p>
            There are the following rules to initially choose a token into which the exchange will be made:
          </p>
          <ul>
            <li>
              The algorithm will try to find a token from the same blockchain to which the user's wallet is connected, in order of priority from top to bottom taken from Payment Settings.
            </li>
            <li>
              If failed then the algorithm will try to take tokens from other blockchains in order of priority from top to bottom taken from Payment Settings.
            </li>
          </ul>

          <p>
            Example:<br />
            You are ready to accept payments only USDT and USDC on Ethereum and USDT on Hardhat blockchain:
          </p>
          <p>
            <Image src='../locales/en/img/payment_settings_3.png' fluid />
          </p>
          <p>
            And user decided to pay ETH on Ethereum blockchain. Then:
          </p>
          <ul>
            <li>
              The algorithm will try to find exchange path from Ethereum ETH to Ethereum USDT.
            </li>
            <li>
              If failed, it will try to find exchange path from Ethereum ETH to Ethereum USDС.
            </li>
            <li>
              If failed, it will try to find exchange path from Ethereum ETH to Hardhat USDT.
            </li>
          </ul>

          <p>
            Payment settings recommendations:
          </p>
          <ul>
            <li>
              Your account will already contain the recommended settings after creation. Adjust it if necessary.
            </li>
            <li>
              Remove volatile tokens and leave only stablecoins if stable value is important to you.
            </li>
            <li>
              Choose popular blockchains with high TVL.
            </li>
            <li>
              Place the blockchains with the lowest transaction fee at the top of the list. This is necessary for optimal working of the token exchange algorithm.
            </li>
          </ul>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            Вы можете задать блокчейны и токены, в которых вы непосредственно готовы принимать платежи, на странице <a href={`${config.config?.baseUrlAccount}/#payment_settings`} target="_blank">Настройки платежей</a>. Пользователи по прежнему смогут совершать оплату в других блокчейнах и токенах, но при этом токены будут конвертироваться в один из указанных вами.
          </p>
          <p>
            Пример:<br/>
            Вы готовы принимать платежи только в Bitcoin и стейблкоинах USDT на блокчейне Ethereum и ваши настройки следующие:
          </p>
          <p>
            <Image src='../locales/ru/img/payment_settings_1.png' fluid />
          </p>
          <p>
            Пользователь открывает форму оплаты и выбирает блокчейн Hardhat и токен ETH. Токен не включен в Настройки платежей.
          </p>
          <p>
            <Image src='../locales/ru/img/payment_settings_2.png' fluid />
          </p>
          <p>
            Как вы видите, форма оплаты подскажет ему, что его токен будет сконвертирован в USDT и отправлен продавцу. Это означает, что вы получите не волатильный ETH, а стейблкоин USDT.
          </p>
          <p>
            Существуют следующие правила первоначального выбора токена, в который будет производиться конвертация:
          </p>
          <ul>
            <li>
              Алгоритм попробует найти токен из того же блокчейна, к которому подключен кошелек пользователя, по приоритету сверху вниз из Настроек платежей.
            </li>
            <li>
              В случае неудачи алгоритм попробует взять токены из других блокчейнов по приоритету сверху вниз из Настроек платежей.
            </li>
          </ul>

          <p>
            Пример:<br />
            Вы готовы принимать платежи только в USDT и USDC на Ethereum и USDT на блокчейне Hardhat:
          </p>
          <p>
            <Image src='../locales/ru/img/payment_settings_3.png' fluid />
          </p>
          <p>
            И пользователь решил расплатиться ETH в блокчейне Ethereum. Тогда:
          </p>
          <ul>
            <li>
              Вначале алгоритм попробует найти путь конвертации Ethereum ETH в Ethereum USDT.
            </li>
            <li>
              В случае неудачи он попытается найти путь конвертации из Ethereum ETH в Ethereum USDС.
            </li>
            <li>
              В случае неудачи он попытается найти путь конвертации из Ethereum ETH в Hardhat USDT.
            </li>
          </ul>

          <p>
            Рекомендации по настройкам оплаты:
          </p>
          <ul>
            <li>
              Ваш аккаунт уже будет содержать рекомендуемые настройки после создания. Поменяйте их при необходимости.
            </li>
            <li>
              Уберите волатильные токены и оставьте только стейблкоины, если вам важна стабильная стоимость.
            </li>
            <li>
              Выбирайте популярные блокчейны с высоким TVL.
            </li>
            <li>
              Поместите блокчейны с наименьшими комиссиями за транзакцию в начало списка. Это необходимо для оптимальной работы алгоритма конвертации токенов.
            </li>
          </ul>
        </>
      )}
    </>
  )
}

export default PaymentSettings
