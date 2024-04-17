import React, { useEffect, useState } from 'react'
import { Button, Card, Form, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useAccountApiSettings } from '../../../../states/account-settings/hook'
import RbacGuard from '../../../Guards/RbacGuard'
import ApiSettingsButtons from '../ApiSettingsButtons'

const ApiSettings: React.FC = () => {
  const [currentApiKey, setCurrentApiKey] = useState<string>('')
  const [showApiKey, setShowApiKey] = useState(false)

  const { t } = useTranslation()
  const apiSettings = useAccountApiSettings()

  useEffect(() => {
    setCurrentApiKey(apiSettings?.apiKey ?? '')
  }, [apiSettings])

  return (
    <Card className='mb-3'>
      <Card.Body>
        <Card.Title>
          {t('components.account_settings.api_settings_title')}
        </Card.Title>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('components.account_settings.api_title')}</Form.Label>
            <InputGroup>
              <Form.Control
                type={showApiKey ? "text" : "password"}
                placeholder={t('components.account_settings.api_key_placeholder')}
                readOnly
                defaultValue={currentApiKey}
              />
              <Button variant="outline-secondary" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? t('common.hide_btn') : t('common.show_btn')}
              </Button>
            </InputGroup>
            <Form.Text className="text-muted">
              {t('components.account_settings.api_key_desc')}
            </Form.Text>
          </Form.Group>

          <RbacGuard requiredKeys={['api_settings']} requiredPermission='Modify' element={<ApiSettingsButtons apiKey={currentApiKey} />} />
        </Form>
      </Card.Body>
    </Card>
  )
}

export default ApiSettings
