import { useCallback, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

interface EmailInputProps {
  email: string | undefined
  disabled?: boolean
  onChange: (email: string) => void
}

const EmailInput: React.FC<EmailInputProps> = (props) => {
  const { email, disabled, onChange } = props

  const { t } = useTranslation()
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>(email)

  const changeHandler = useCallback((emailToUpdate: string) => {
    setSelectedEmail(emailToUpdate)
    onChange(emailToUpdate)
  }, [onChange])

  return (
    <Form.Group>
      <Form.Control type="email" placeholder={t('components.evm_payment.email_placeholder')} value={selectedEmail ?? ''} disabled={disabled} onChange={e => changeHandler(e.target.value)} />
      <Form.Text className="text-muted">
        {t('components.evm_payment.send_details')}
      </Form.Text>
    </Form.Group>
  )
}

export default EmailInput
