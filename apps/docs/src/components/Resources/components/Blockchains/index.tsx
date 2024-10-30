import { ListGroup, Spinner, Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useSettings } from '../../../../states/settings/hook'
import { useBlockchains } from '../../../../states/meta/hook'
import { findBlockchainByName, stringComparator } from '../../../../libs/utils'

const Blockchains: React.FC = () => {
  const { t } = useTranslation()

  const blockchains = useBlockchains()
  const settings = useSettings()

  return (
    <>
      <h1 className="mb-3">
        {t('components.resources.resources_blockchains_title')}
      </h1>

      <ListGroup className="overflow-auto rounded-0">
        {(!blockchains || !settings.current) && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        )}

        {(!!blockchains && !!settings.current && settings.current.paymentBlockchains.length === 0) && (
          <ListGroup.Item className="d-flex justify-content-between align-items-start border-0">
            <div className='d-flex align-items-center'>
              {t('common.nothing_found')}
            </div>
          </ListGroup.Item>
        )}

        {(!!blockchains && !!settings.current && settings.current.paymentBlockchains.length > 0) && (
          settings.current.paymentBlockchains
            .map(item => findBlockchainByName(blockchains, item.blockchain))
            .sort((a, b) => a && b ? stringComparator(a.displayName, b.displayName) : -1)
            .map(blockchain => !!blockchain && (
              <ListGroup.Item key={blockchain?.name} className="d-flex justify-content-between align-items-start border-0">
                <div className='d-flex align-items-center'>
                  <Image srcSet={blockchain?.logo} alt="..." style={{ width: '45px', height: '45px' }} />
                  <div className='ms-3'>
                    <p className='fw-bold mb-1'>{blockchain?.displayName}</p>
                    <p className='text-muted mb-0'>{blockchain?.name}</p>
                  </div>
                </div>
              </ListGroup.Item>
            ))
        )}
      </ListGroup>
    </>
  )
}

export default Blockchains
