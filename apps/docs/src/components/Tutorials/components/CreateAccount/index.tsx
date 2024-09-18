import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const CreateAccount: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_create_account_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            Install a crypto wallet if you don't already have one. With it, you can create an account and log in, as well as withdraw funds. For example, <a href='https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn' target='_blank'>Metamask</a>. It is required for authorization, receiving and withdrawals funds.
          </p>
          <p>
            Open <a href={config.config?.baseUrlAccount} target="_blank">JaneDoe</a> and click on the button <code>Connect Wallet</code>.
          </p>
          <p>
            <Image src='../locales/en/img/create_account_1.png' fluid/>
          </p>
          <p>
            Select on the installed crypto wallet, for example, Metamask.
          </p>
          <p>
            <Image src='../locales/en/img/create_account_2.png' fluid/>
          </p>
          <p>
            Click on the button <code>Sign In or Sign Up</code>
          </p>
          <p>
            <Image src='../locales/en/img/create_account_3.png' fluid/>
          </p>
          <p>
            Your wallet will ask you to sign a "one time nonce". Click on the button <code>Sign</code>. There is no gas fee for this action since there is no interaction with the real blockchain. This is necessary for cryptographically verification that you are the owner of wallet.
          </p>
          <p>
            <Image src='../locales/en/img/create_account_4.png' fluid/>
          </p>
          <p>
            Your account will be successfully created and you will be able to accept payments.
          </p>
          <p>
            <Image src='../locales/en/img/create_account_5.png' fluid/>
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
        <p>
          Установите криптокошелек, если его еще у вас нет. С его помощью вы сможете создать учетную запись и авторизоваться а также выводить средства. Например, <a href='https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn' target='_blank'>Metamask</a>. Он необходим для авторизации, получения и вывода средств.
        </p>
        <p>
          Откройте <a href={config.config?.baseUrlAccount} target="_blank">JaneDoe</a> и нажмите на кнопку <code>Подключить кошелек</code>.
        </p>
        <Image src='../locales/ru/img/create_account_1.png' fluid/>
        <p>
          Выберите установленный криптокошелек, например, Metamask.
        </p>
        <Image src='../locales/ru/img/create_account_2.png' fluid/>
        <p>
          Нажмите на кпопку <code>Войти или зарегистрироваться</code>
        </p>
        <Image src='../locales/ru/img/create_account_3.png' fluid/>
        <p>
          Ваш кошелек попросит вас подписать "one time nonce". Нажмите на кнопку <code>Sign</code>. Плата за газ за это действие не взимается, так как нет взаимодействия с реальным блокчейном. Это необходимо, чтобы криптографическим способом убедиться, что вы владелец кошелька.
        </p>
        <Image src='../locales/ru/img/create_account_4.png' fluid/>
        <p>
          Ваш аккаунт будет успешно создан и вы сможете принимать платежи.
        </p>
        <Image src='../locales/ru/img/create_account_5.png' fluid/>
      </>
      )}
    </>
  )
}

export default CreateAccount
