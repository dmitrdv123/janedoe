import { useCallback, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

interface EmailInputProps {
  email: string
  onChange: (email: string) => void
}

const EmailInput: React.FC<EmailInputProps> = (props) => {
  const { email, onChange } = props

  const { t } = useTranslation()
  const [selectedEmail, setSelectedEmail] = useState<string>(email)

  const changeHandler = useCallback((emailToUpdate: string) => {
    setSelectedEmail(emailToUpdate)
    onChange(emailToUpdate)
  }, [onChange])

  return (
    <>
      <Form.Group>
        <Form.Label>
          {t('components.transfer_payment.email')}
        </Form.Label>
        <Form.Control
          type="email"
          placeholder={t('components.transfer_payment.email_placeholder')}
          value={selectedEmail}
          onChange={e => changeHandler(e.target.value)}
        />
        <Form.Text className="text-muted">
          {t('components.transfer_payment.send_details')}
        </Form.Text>
      </Form.Group>
    </>
  )
}

export default EmailInput
