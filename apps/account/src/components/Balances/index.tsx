import { useCallback, useMemo, useState } from 'react'
import { Alert, Button, Spinner, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'
import useLocalStorageState from 'use-local-storage-state'
import { useAccount } from 'wagmi'

import { useBlockchains } from '../../states/meta/hook'
import { findBlockchainByName } from '../../libs/utils'
import BalancesBlockchain from './components/BalancesBlockchain'
import { useSettings } from '../../states/settings/hook'
import { WithdrawResult } from '../../types/withdraw_result'
import { AuthData } from '../../types/auth-data'
import { AUTH_DATA_KEY } from '../../constants'
import RbacGuard from '../Guards/RbacGuard'
import TransactionHash from '../TransactionHash'

const Balances: React.FC = () => {
  const { t } = useTranslation()
  const [authData] = useLocalStorageState<AuthData>(AUTH_DATA_KEY)
  const { address } = useAccount()

  const appSettings = useSettings()
  const blockchains = useBlockchains()

  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false)
  const [isForceRefresh, setIsForceRefresh] = useState<boolean>(false)
  const [withdrawResults, setWithdrawResults] = useState<{ [key: string]: WithdrawResult }>({})

  const targetBlockchains = useMemo(() => {
    if (blockchains === undefined || blockchains.length === 0) {
      return undefined
    }

    return appSettings.current?.paymentBlockchains
      .map(item => findBlockchainByName(blockchains, item.blockchain))
      .filter(item => !!item) as BlockchainMeta[] | undefined
  }, [blockchains, appSettings])

  const forceRefreshEndHandler = useCallback(() => {
    setIsForceRefresh(false)
  }, [])

  const processingWithdrawHandler = useCallback((isProcessing: boolean) => {
    setIsWithdrawProcessing(isProcessing)
  }, [])

  const successWithdrawHandler = useCallback((blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => {
    setWithdrawResults(val => {
      if (val[blockchain.name] && val[blockchain.name].hash === hash) {
        return val
      }

      const res = { ...val }
      res[blockchain.name] = { blockchain, hash, message }
      return res
    })
  }, [])

  const forceRefreshHandler = () => {
    setIsForceRefresh(true)
  }

  const removeWithdrawResults = (blockchain: string) => {
    setWithdrawResults(val => {
      const res = { ...val }
      delete res[blockchain]
      return res
    })
  }

  return (
    <>
      <h3 className="mb-3">{t('components.balances.title')}</h3>

      {Object.values(withdrawResults).map(result => (
        <Alert
          key={result.blockchain.name}
          variant='success'
          dismissible
          onClose={() => removeWithdrawResults(result.blockchain.name)}
        >
          {t('components.balances.success', { blockchain: result.blockchain.displayName })} {result.hash && (<TransactionHash blockchain={result.blockchain} transaction={result.hash} />)}
          {!!result.message && (
            <div>{result.message}</div>
          )}
        </Alert>
      ))}

      <RbacGuard requiredKeys={['balances']} requiredPermission='Modify' element={
        <>
          {(authData && address && authData.address.toLocaleLowerCase() !== address.toLocaleLowerCase()) && (
            <Alert variant='warning' className='text-wrap text-truncate'>
              {t('components.balances.change_wallet_withdraw_alert', { address: authData?.address })}
            </Alert>
          )}
        </>
      } />

      {(!targetBlockchains) && (
        <div>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        </div>
      )}

      {!!targetBlockchains && (
        <>
          <div className='mb-3'>
            <Button variant="primary" onClick={forceRefreshHandler} disabled={isForceRefresh}>
              {t('common.refresh_all_btn')}
              {isForceRefresh && (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                  <span className="visually-hidden">{t('common.processing')}</span>
                </Spinner>
              )}
            </Button>
          </div>

          <Table bordered responsive size="sm">
            <thead>
              <tr >
                <th>{t('components.balances.blockchain_col')}</th>
                <th>{t('components.balances.blockchain_tokens_col')}</th>
                <th>{t('components.balances.blockchain_total_col')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {targetBlockchains.map((blockchain) => {
                return <BalancesBlockchain
                  key={`balances_${blockchain.name}`}
                  blockchain={blockchain}
                  isDisable={isWithdrawProcessing}
                  isForceRefresh={isForceRefresh}
                  onForceRefreshEnd={forceRefreshEndHandler}
                  onProcessing={processingWithdrawHandler}
                  onSuccess={(hash, message) => successWithdrawHandler(blockchain, hash, message)}
                />
              })}
            </tbody>
          </Table>
        </>
      )}
    </>
  )
}

export default Balances
