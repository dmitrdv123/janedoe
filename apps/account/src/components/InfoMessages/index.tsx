import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useInfoMessages } from '../../states/application/hook'
import { ServiceError } from '../../types/service-error'
import { convertErrorToMessage } from '../../libs/utils'
import { useCallback } from 'react'

const InfoMessages: React.FC = () => {
  const { t } = useTranslation()

  const { infoMessages, removeInfoMessage } = useInfoMessages()

  const getServiceError = useCallback((error: ServiceError) => {
    return (
      <>
        {t(error.code, error.args)}{error.message ? `: ${error.message}` : ''}
      </>
    )
  }, [t])

  const getError = useCallback((error: unknown) => {
    return <>{convertErrorToMessage(error, t('common.errors.default'))}</>
  }, [t])

  return (
    <div className='sticky-top'>
      {[...infoMessages]
        .reverse()
        .map(item =>
          <Alert
            key={item.key}
            variant={item.variant ?? 'info'}
            onClose={() => removeInfoMessage(item.key)}
            dismissible
          >
            <div className="mb-2">
              {item.content}
            </div>

            {(!!item.error && (item.error as Error).name === ServiceError.NAME) && (
              <>
                {getServiceError(item.error as ServiceError)}
              </>
            )}

            {(!!item.error && (item.error as Error).name !== ServiceError.NAME) && (
              <>
                {getError(item.error)}
              </>
            )}
          </Alert>
        )
      }
    </div>
  )
}

export default InfoMessages
