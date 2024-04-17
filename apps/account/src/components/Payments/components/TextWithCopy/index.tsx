import { Clipboard } from 'react-bootstrap-icons'
import { cutString, isNullOrEmptyOrWhitespaces } from '../../../../libs/utils'

interface TextWithCopyProps {
  value: string | null | undefined
}

const TextWithCopy: React.FC<TextWithCopyProps> = (props) => {
  return (
    <>
      {(!!props.value && !isNullOrEmptyOrWhitespaces(props.value)) && (
        <div data-bs-toggle="tooltip" data-bs-placement="bottom" title={!!props.value && !isNullOrEmptyOrWhitespaces(props.value) ? props.value : ''}>
          {cutString(props.value)} <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.value ?? '')}><Clipboard/></button>
        </div>
      )}
    </>
  )
}

export default TextWithCopy
