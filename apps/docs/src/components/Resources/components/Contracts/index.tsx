import { Spinner, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, EVMChainInfo, TransactionType } from 'rango-sdk-basic'

import { useSettings } from '../../../../states/settings/hook'
import { SUPPORTED_LANGUAGES } from '../../../../constants'
import { findBlockchainByName, stringComparator } from '../../../../libs/utils'
import { AppSettingsContracts } from '../../../../types/app-settings'
import { useBlockchains } from '../../../../states/meta/hook'

const Contracts: React.FC = () => {
  const { t, i18n } = useTranslation()

  const settings = useSettings()
  const blockchains = useBlockchains()

  const getContracts = (contractsToUse: AppSettingsContracts[], blockchainsToUse: BlockchainMeta[]) => {
    return [...contractsToUse]
      .sort((a, b) => stringComparator(a.blockchain, b.blockchain))
      .map(contract => {
        const blockchain = findBlockchainByName(blockchainsToUse, contract.blockchain)

        return Object.keys(contract.contractAddresses)
          .filter(key => key.toLocaleLowerCase() !== 'rangoreceiver')
          .sort()
          .map(key => (
            <tr key={[contract.blockchain, key].join('_')}>
              <td>{blockchain?.displayName ?? contract.blockchain}</td>
              <td>{key}</td>
              <td>
                {(blockchain?.type !== TransactionType.EVM) && (
                  <>
                    {contract.contractAddresses[key]}
                  </>
                )}

                {(blockchain?.type === TransactionType.EVM) && (
                  <a href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', contract.contractAddresses[key])} target='_blank' className="text-decoration-none">
                    {contract.contractAddresses[key]}
                  </a>
                )}
              </td>
            </tr>
          ))
      })
  }

  return (
    <>
      <h1 className="mb-3">
        {t('components.resources.resources_contracts_title')}
      </h1>

      {(i18n.language.toLocaleLowerCase() === 'en' || SUPPORTED_LANGUAGES.findIndex(lang => lang === i18n.language.toLocaleLowerCase()) === -1) && (
        <>
          <p>
            JaneDoe - main contract based on the <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>ERC1155 standard</a>. It stores your funds.
          </p>

          <p>
            WrappedNative - contract based on the <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-20" target='blank'>ERC20 standard</a>. It is wrapper around blockchain native currency.
          </p>
        </>
      )}

      {i18n.language.toLocaleLowerCase() === 'ru' && (
        <>
          <p>
            JaneDoe - основной контракт на основе <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-1155" target='blank'>стандарта ERC1155</a>. Он хранит ваши средства.
          </p>

          <p>
            WrappedNative - контракт на основе <a href="https://ethereum.org/ru/developers/docs/standards/tokens/erc-20" target='blank'>стандарта ERC20</a>. Он является оберткой для нативной криптовалюты блокчейна.
          </p>
        </>
      )}

      {(!blockchains || !settings.current) && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      )}

      {(!!blockchains && !!settings.current && settings.current.contracts.length === 0) && (
        <p>
          {t('common.nothing_found')}
        </p>
      )}

      {(!!blockchains && !!settings.current && settings.current.contracts.length > 0) && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('components.resources.resources_contracts_blockchain_col')}</th>
              <th>{t('components.resources.resources_contracts_contract_col')}</th>
              <th>{t('components.resources.resources_contracts_address_col')}</th>
            </tr>
          </thead>
          <tbody>
            {getContracts(settings.current.contracts, blockchains)}
          </tbody>
        </Table>
      )}

    </>
  )
}

export default Contracts
