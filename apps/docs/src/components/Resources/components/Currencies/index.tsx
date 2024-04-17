import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../../states/settings/hook'
import { ListGroup, Spinner } from 'react-bootstrap'

const Currencies: React.FC = () => {
  const { t } = useTranslation()
  const settings = useSettings()

  return (
    <>
      <h1 className="mb-3">
        {t('components.resources.resources_currencies_title')}
      </h1>

      <ListGroup className="overflow-auto rounded-0">
        {!settings.current && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        )}

        {(!!settings.current && settings.current.currencies.length === 0) && (
          <ListGroup.Item className="d-flex justify-content-between align-items-start border-0">
            <div className='d-flex align-items-center'>
              {t('common.nothing_found')}
            </div>
          </ListGroup.Item>
        )}

        {(!!settings.current && settings.current.currencies.length > 0) && (
          settings.current.currencies.map(
            item =>
              <ListGroup.Item
                key={item.symbol}
                className="d-flex justify-content-between align-items-start border-0"
              >
                <div className='d-flex align-items-center'>
                  <div className='ms-3'>
                    <p className='fw-bold mb-1'>{item.symbol}</p>
                    <p className='text-muted mb-0'>{item.desc} ({item.country})</p>
                  </div>
                </div>
              </ListGroup.Item>
          )
        )}
      </ListGroup>
    </>
  )
}

export default Currencies
