import { Button, Form, InputGroup } from 'react-bootstrap'
import { Clipboard } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

interface AddressInputProps {
  address: string
}

const AddressInput: React.FC<AddressInputProps> = (props) => {
  const { address } = props

  const { t } = useTranslation()

  return (
    <>
      <Form.Label>
        {t('components.transfer_payment.send_address')}
      </Form.Label>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={t('components.transfer_payment.address_placeholder')}
          value={address}
          readOnly
        />
        <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText(address)}>
          <Clipboard />
        </Button>
      </InputGroup>
    </>
  )
}

export default AddressInput
