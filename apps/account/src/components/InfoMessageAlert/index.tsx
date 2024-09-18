import { useCallback } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { ServiceError } from '../../types/service-error'
import { convertErrorToMessage } from '../../libs/utils'
import { useInfoMessages } from '../../states/application/hook'
import { InfoMessage } from '../../types/info-message'

interface InfoMessageAlertProps {
  infoMessage: InfoMessage
}

const InfoMessageAlert: React.FC<InfoMessageAlertProps> = (props) => {
  const { infoMessage } = props
  const { t } = useTranslation()
  const { removeInfoMessage } = useInfoMessages()

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
    <Alert
      key={infoMessage.key}
      variant={infoMessage.variant ?? 'info'}
      onClose={() => removeInfoMessage(infoMessage.key)}
      dismissible
      className='text-wrap text-truncate'
    >
      <div className="mb-2">
        {infoMessage.content}
      </div>

      {(!!infoMessage.error && (infoMessage.error as Error).name === ServiceError.NAME) && (
        <>
          {getServiceError(infoMessage.error as ServiceError)}
        </>
      )}

      {(!!infoMessage.error && (infoMessage.error as Error).name !== ServiceError.NAME) && (
        <>
          {getError(infoMessage.error)}
        </>
      )}
    </Alert>
  )
}

export default InfoMessageAlert
