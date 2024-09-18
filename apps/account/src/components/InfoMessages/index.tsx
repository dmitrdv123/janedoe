import { useInfoMessages } from '../../states/application/hook'
import InfoMessageAlert from '../InfoMessageAlert'

const InfoMessages: React.FC = () => {
  const { infoMessages } = useInfoMessages()

  return (
    <div className='sticky-top'>
      {[...infoMessages]
        .reverse()
        .map(item => <InfoMessageAlert infoMessage={item} />)
      }
    </div>
  )
}

export default InfoMessages
