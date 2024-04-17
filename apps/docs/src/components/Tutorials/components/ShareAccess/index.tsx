import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const ShareAccess: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_share_access_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            Open page <a href={`${config.config?.baseUrlAccount}/#account_settings`} target="_blank">Account Settings</a> and find <code>Team Settings</code>. Click on button <code>Add User</code>. Enter the wallet address to which you are giving access to your account.
          </p>
          <p>
            <Image src='locales/en/img/share_access_1.png' fluid />
          </p>
          <p>
            Click on <code>Show Permissions</code>. You will see various administrative functions that you can control access to. By specifying <code>Disable</code>, the user will not have access. By specifying <code>View</code>, the user will only be able to view. By specifying <code>Modification</code>, the user will be able to perform actions that change the data, such as changing settings. Please note, that only <code>Disable</code> and <code>View</code> can be set for <code>Balances</code>. There is no <code>Modification</code>, since only the account owner can withdraw funds.
          </p>
          <p>
            <Image src='locales/en/img/share_access_2.png' fluid />
          </p>
          <p>
            Click on button <code>Save</code>. After that the user will see an account selection page upon authorization. He will be able to choose which account to log into.
          </p>
          <p>
            <Image src='locales/en/img/share_access_3.png' fluid />
          </p>
          <p>
            Account can be changed also in the navigation bar at the top of the page.
          </p>
          <p>
            <Image src='locales/en/img/share_access_4.png' fluid />
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
        <p>
          Откройте страницу <a href={`${config.config?.baseUrlAccount}/#account_settings`} target="_blank">Настройки аккаунта</a> и найдите <code>Командные настройки</code>. Нажмите на кнопку <code>Добавить пользователя</code>. Введите адрес кошелька, которому вы даете доступ к вашему аккаунту.
        </p>
        <p>
          <Image src='locales/ru/img/share_access_1.png' fluid />
        </p>
        <p>
          Нажмите на <code>Показать разрешения</code>. Вы увидите различные административные функции, доступ к которым вы можете регулировать. Указав <code>Запрет</code>, пользователь не будет иметь доступа. Указав <code>Просмотр</code>, пользователь сможет только просматривать. Указав <code>Изменение</code>, пользователь сможет выполнять действия, которые меняют данные, например, менять настройки. Обратите внимание, что для <code>Балансов</code> можно задать только <code>Запрет</code> и <code>Просмотр</code>. <code>Изменение</code> отсутствует, так как снимать средства может только владелец аккаунта.
        </p>
        <p>
          <Image src='locales/ru/img/share_access_2.png' fluid />
        </p>
        <p>
          Нажмите на кнопку <code>Сохранить</code>. После этого пользователь увидит страницу выбора аккаунта при авторизации. На ней он сможет выбрать в какой аккаунт авторизоваться.
        </p>
        <p>
          <Image src='locales/ru/img/share_access_3.png' fluid />
        </p>
        <p>
          Аккаунт можно изменить также в панели навигации вверху страницы.
        </p>
        <p>
          <Image src='locales/ru/img/share_access_4.png' fluid />
        </p>
      </>
      )}
    </>
  )
}

export default ShareAccess
