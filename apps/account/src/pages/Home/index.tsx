import { Trans, useTranslation } from 'react-i18next'
import useLocalStorageState from 'use-local-storage-state'

import { AuthData } from '../../types/auth-data'
import { useConfig } from '../../context/config/hook'
import { AUTH_DATA_KEY } from '../../constants'

const Home: React.FC = () => {
  const { t } = useTranslation()
  const [authData] = useLocalStorageState<AuthData>(AUTH_DATA_KEY)
  const config = useConfig()

  return (
    <>
      <h3 className="mb-3">
        {t('components.home.title')}
      </h3>

      {!!authData && (
        <>
          <p>
            {t('components.home.desc')}
            <br />
            <strong>
              {config.config?.baseUrlPayment}/{authData.id}/<code>&lt;payment id&gt;</code>/<code>&lt;currency&gt;</code>/<code>&lt;currency amount&gt;</code>
            </strong>
          </p>

            {t('components.home.payment_where')}
            <ul className='mb-3'>
              <li>
                <code>{authData.id}</code> {t('components.home.account_id_desc')}
              </li>
              <li>
                <Trans i18nKey="components.home.payment_id_desc">
                  Replace <code>payment id</code> with some unique id that will be allowed to identify user purchases. It can be any string with max length = 50 that contains alhabetic symbols, numbers, symbols '_', '-'.
                </Trans>
              </li>
              <li>
                <Trans i18nKey="components.home.currency_desc">
                  Replace <code>currency</code> with the necessary fiat currency, for example, USD
                </Trans> (<a href={`${config.config?.baseUrlDocs}/#resources_currencies`} target='_blank'>{t('components.home.currency_List')}</a>).
              </li>
              <li>
                <Trans i18nKey="components.home.currency_amount_desc">
                  Replace <code>currency amount</code> with the necessary payment amount in choosed currency, for example, in USD amount.
                </Trans>
              </li>
            </ul>

          <p>
            {t('components.home.example')}
            <br />
            <a href={`${config.config?.baseUrlPayment}/${authData.id}/123/usd/10`} target='_blank'>{config.config?.baseUrlPayment}/{authData.id}/123/usd/10</a>
          </p>

          <p>
            <Trans i18nKey="components.home.more_details">
              More details in <a href={config.config?.baseUrlDocs} target='_blank'>documentation</a>.
            </Trans>
          </p>
        </>
      )}
    </>
  )
}

export default Home
