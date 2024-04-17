import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Form, InputGroup, ListGroup, Modal, Image, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Search } from 'react-bootstrap-icons'
import { BlockchainMeta } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useInfoMessages, useModalIsOpen, useToggleModal } from '../../../states/application/hook'
import { ApplicationModal } from '../../../types/application-modal'
import { isNullOrEmptyOrWhitespaces, findBlockchainByName, findNativeToken, sameTokenAndAsset, stringComparator } from '../../../libs/utils'
import useBlockchainsDb from '../../../libs/hooks/useBlockchainsDB'
import { useSettings } from '../../../states/settings/hook'
import { useBlockchains, useTokens } from '../../../states/meta/hook'
import { INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR } from '../../../constants'
import { AccountPaymentSettings } from '../../../types/account-settings'
import { blockchainSchema } from '../../../types/orama'

interface BlockchainsModalProps {
  accountPaymentSettings: AccountPaymentSettings
  onUpdateAccountPaymentSettings: (accountPaymentSettings: AccountPaymentSettings) => void
}

const BlockchainsModal: React.FC<BlockchainsModalProps> = (props) => {
  const [results, setResults] = useState<BlockchainMeta[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)

  const { t } = useTranslation()

  const settings = useSettings()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const modalOpen = useModalIsOpen(ApplicationModal.BLOCKCHAIN)
  const toggleModal = useToggleModal(ApplicationModal.BLOCKCHAIN)

  const preparedBlockchains = useMemo(() => {
    if (!blockchains) {
      return undefined
    }

    return settings.current?.paymentBlockchains
      .map(item => {
        const isExist = props.accountPaymentSettings.blockchains
          .findIndex(supportedBlockchain => supportedBlockchain.toLocaleLowerCase() === item.blockchain.toLocaleLowerCase()) !== -1

        if (isExist) {
          return undefined
        } else {
          return blockchains?.find(blockchain => blockchain.name.toLocaleLowerCase() === item.blockchain.toLocaleLowerCase())
        }
      })
      .filter(item => !!item)
      .sort((a, b) => stringComparator((a as BlockchainMeta).displayName, (b as BlockchainMeta).displayName)) as BlockchainMeta[]
  }, [settings, props.accountPaymentSettings, blockchains])

  const blockchainsDb = useBlockchainsDb(preparedBlockchains)

  useEffect(() => {
    const searchBlockchains = async (blockchainsDb: Orama<typeof blockchainSchema>, query: string) => {
      const result = await search(blockchainsDb, {
        term: query,
        properties: ['name', 'displayName']
      })

      const preparedResults = result.hits
        .sort((a, b) => {
          if (a.score < b.score) {
            return 1
          }

          if (a.score > b.score) {
            return -1
          }

          return stringComparator(a.document.displayName, a.document.displayName)
        })
        .map(item => preparedBlockchains ? findBlockchainByName(preparedBlockchains, item.document.name) : undefined)
        .filter(item => !!item) as BlockchainMeta[]

      setResults(preparedResults)
    }

    if (blockchainsDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchBlockchains(blockchainsDb, deferredQuery)
    } else {
      setResults(preparedBlockchains)
    }
  }, [preparedBlockchains, blockchainsDb, deferredQuery])

  const blockchainSelectHandler = useCallback((name: string) => {
    if (blockchains === undefined || tokens === undefined) {
      return
    }

    const blockchain = findBlockchainByName(blockchains, name)
    if (blockchain === undefined) {
      addInfoMessage(t('components.payment_settings.errors.cannot_find_blockchain', { blockchain: name }), INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR, 'danger')
      return
    }

    const token = findNativeToken(blockchain, tokens)
    if (token === undefined) {
      addInfoMessage(t('components.payment_settings.errors.cannot_find_native_token', { blockchain: blockchain.name }), INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR, 'danger')
      return
    }

    removeInfoMessage(INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR)

    const asset = {
      blockchain: blockchain.name,
      address: isNullOrEmptyOrWhitespaces(token.address) ? null : token.address,
      symbol: token.symbol
    }

    props.onUpdateAccountPaymentSettings({
      blockchains: [
        ...(props.accountPaymentSettings.blockchains).filter(item => item.toLocaleLowerCase() !== blockchain.name.toLocaleLowerCase()),
        blockchain.name
      ],
      assets: [
        ...(props.accountPaymentSettings.assets).filter(item => !sameTokenAndAsset(item, token)),
        asset
      ]
    })
  }, [props, t, blockchains, tokens, addInfoMessage, removeInfoMessage])

  return (
    <Modal show={modalOpen} onHide={toggleModal} className="modal-list">
      <Modal.Header closeButton>
        <Modal.Title>
          {t('components.payment_settings.blockchain_modal_title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-3">
          <InputGroup className="mb-3">
            <Form.Control
              placeholder={t('components.payment_settings.blockchain_modal_search_placeholder')}
              onChange={e => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoFocus={true}
            />
            <InputGroup.Text><Search /></InputGroup.Text>
          </InputGroup>
        </div>

        <ListGroup className="overflow-auto rounded-0 modal-list-group">
          {(!results) && (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
              <span className="visually-hidden">{t('common.processing')}</span>
            </Spinner>
          )}

          {(!!results && results.length === 0) && (
            <ListGroup.Item className="d-flex justify-content-between align-items-start">
              <div className='d-flex align-items-center'>
                {t('common.nothing_found')}
              </div>
            </ListGroup.Item>
          )}

          {(!!results && results.length > 0) && (
            results.map(result =>
              <ListGroup.Item
                action
                key={result.name}
                onClick={() => blockchainSelectHandler(result.name)}
                className="d-flex justify-content-between align-items-start blockchain-modal-list-group"
              >
                <div className='d-flex align-items-center'>
                  <Image srcSet={result.logo} alt="..." style={{ width: '45px', height: '45px' }} />
                  <div className='ms-3'>
                    <p className='fw-bold mb-1'>{result.displayName}</p>
                    <p className='text-muted mb-0'>{result.name}</p>
                  </div>
                </div>
              </ListGroup.Item>
            )
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>
  )
}

export default BlockchainsModal
