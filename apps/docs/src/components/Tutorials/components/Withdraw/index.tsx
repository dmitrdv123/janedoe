import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { useConfig } from '../../../../context/config/hook'

const Withdraw: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.tutorials_withdraw_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            Open the page <a href={`${config.config?.baseUrlAccount}/balances`} target="_blank">Balances</a>. You will see the your balances for each of the blockchains. <code>Withdraw</code> or <code>Withdraw All</code> buttons allow to withdraw funds to your wallet. Withdrawals will be made to the address of the account owner, the address, that was used for creating the account.
          </p>
          <p>
            <Image src='../locales/en/img/withdraw_1.png' fluid />
          </p>
          <p>
            To withdraw bitcoins you need to specify the wallet address and click on <code>Withdraw All</code>
          </p>
          <p>
            <Image src='../locales/en/img/withdraw_2.png' fluid />
          </p>
          <p>
            We do not store your funds in custodial wallets in the case of Ethereum compatible blockchains. Your funds are stored in a smart contract based on the <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>ERC1155 standard</a> and can be withdrawn to your wallet.
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            Откройте страницу <a href={`${config.config?.baseUrlAccount}/balances`} target="_blank">Балансы</a>. Вы увидите ваши балансы на вашем счету по каждому из блокчейнов. Кнопки <code>Снять</code> или <code>Снять все</code> позволят вывести средства на ваш кошелек. Вывод средств будет осуществлен на адрес владельца аккаунта, адрес, который был использован для создания аккаунта.
          </p>
          <p>
            <Image src='../locales/ru/img/withdraw_1.png' fluid />
          </p>
          <p>
            Для вывода биткоинов вам необходимо указать адрес кошелька и нажать на <code>Снять все</code>
          </p>
          <p>
            <Image src='../locales/ru/img/withdraw_2.png' fluid />
          </p>
          <p>
            Мы не храним ваши средства в кастодиальных кошельках в случае EVM совместимых блокчейнов. Ваши средства хранятся в смарт контракте на основе <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>стандарта ERC1155</a> и могут быть выведены на ваш кошелек.
          </p>
        </>
      )}
    </>
  )
}

export default Withdraw
