import { useEffect, useState } from 'react'

import { SETTINGS_UPDATE_INTERVAL_MS } from '../../constants'
import { useSettings } from '../../states/settings/hook'
import { useTranslation } from 'react-i18next'

const UpdateTimer: React.FC = () => {
  const [seconds, setSeconds] = useState<number | undefined>(undefined)

  const { t } = useTranslation()
  const settings = useSettings()

  useEffect(() => {
    const val = settings.dt
      ? Math.floor((Date.now() - (settings.dt - SETTINGS_UPDATE_INTERVAL_MS)) / 1000)
      : undefined

    setSeconds(val)
  }, [settings.dt])

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(seconds => seconds === undefined ? undefined : (seconds > 1 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {!!seconds && (
        <div className='d-flex align-items-center justify-content-center'>
          <p className='mb-0'>{t('components.update_timer.timer', { seconds })}</p>
        </div>
      )}
    </>
  )
}

export default UpdateTimer
